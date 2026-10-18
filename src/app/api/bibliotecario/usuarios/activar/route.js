
import { NextResponse } from "next/server";
import { randomBytes, createHash } from "node:crypto";
import { crearClienteSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verificarBibliotecario } from "@/lib/verificarBibliotecario";

export const runtime = "nodejs";

export async function POST(request) {
  // Verificar que sea un bibliotecario autorizado
  try {
    await verificarBibliotecario(request);
  } catch {
    return NextResponse.json(
      { error: "No tienes permisos de bibliotecario." },
      { status: 403 }
    );
  }

  let datos;

  try {
    datos = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Los datos enviados no son válidos." },
      { status: 400 }
    );
  }

  const idUsuario = datos?.id_usuario;
  const contrasena = datos?.contrasena;

  if (!Number.isSafeInteger(idUsuario) || idUsuario <= 0) {
    return NextResponse.json(
      { error: "Selecciona un usuario válido." },
      { status: 400 }
    );
  }

  if (
    typeof contrasena !== "string" ||
    contrasena.length < 8 ||
    contrasena.length > 72
  ) {
    return NextResponse.json(
      { error: "La contraseña debe tener entre 8 y 72 caracteres." },
      { status: 400 }
    );
  }

  try {
    const supabase = crearClienteSupabaseAdmin();

    // Consultar el perfil existente
    const { data: usuario, error: errorUsuario } = await supabase
      .from("usuarios")
      .select("id_usuario, nombre, correo, rol, estado, auth_user_id")
      .eq("id_usuario", idUsuario)
      .maybeSingle();

    if (errorUsuario) {
      throw errorUsuario;
    }

    if (!usuario) {
      return NextResponse.json(
        { error: "No se encontró el usuario." },
        { status: 404 }
      );
    }

    if (
      usuario.estado !== "activo" ||
      !["estudiante", "docente"].includes(usuario.rol)
    ) {
      return NextResponse.json(
        { error: "Este usuario no puede activarse." },
        { status: 403 }
      );
    }

    if (usuario.auth_user_id) {
      return NextResponse.json(
        { error: "Este usuario ya tiene una cuenta de acceso." },
        { status: 409 }
      );
    }

    // Generar un código aleatorio seguro
    const codigo = randomBytes(32).toString("hex");

    // Guardar solamente el hash del código
    const codigoHash = createHash("sha256")
      .update(codigo)
      .digest("hex");

    // La autorización durará 10 minutos
    const venceEn = new Date(
      Date.now() + 10 * 60 * 1000
    ).toISOString();

    const { data: autorizacion, error: errorAutorizacion } =
      await supabase
        .from("activaciones_usuario")
        .insert({
          id_usuario: usuario.id_usuario,
          codigo_hash: codigoHash,
          vence_en: venceEn,
        })
        .select("id_activacion")
        .single();

    if (errorAutorizacion || !autorizacion) {
      console.error(
        "Error al crear autorización:",
        errorAutorizacion?.message
      );

      return NextResponse.json(
        { error: "No se pudo autorizar la activación." },
        { status: 500 }
      );
    }

    // Crear la cuenta de Auth con el código temporal
    const { data, error } = await supabase.auth.admin.createUser({
      email: usuario.correo,
      password: contrasena,
      email_confirm: true,
      user_metadata: {
        nombre: usuario.nombre,
        rol: usuario.rol,
        codigo_activacion: codigo,
      },
    });

    if (error || !data?.user) {
      console.error(
        "Error al activar cuenta:",
        error?.message || "No se creó el usuario."
      );

      // Eliminar la autorización si falló la creación
      const { error: errorEliminar } = await supabase
        .from("activaciones_usuario")
        .delete()
        .eq("id_activacion", autorizacion.id_activacion);

      if (errorEliminar) {
        console.error(
          "No se pudo limpiar la autorización:",
          errorEliminar.message
        );
      }

      return NextResponse.json(
        { error: "No se pudo crear el acceso del usuario." },
        { status: 400 }
      );
    }

    // Comprobar que se vinculó el perfil original
    const { data: perfil, error: errorPerfil } = await supabase
      .from("usuarios")
      .select("id_usuario, auth_user_id")
      .eq("id_usuario", idUsuario)
      .single();

    if (
      errorPerfil ||
      !perfil ||
      perfil.auth_user_id !== data.user.id
    ) {
      console.error("La cuenta se creó, pero debe revisarse el vínculo.");

      return NextResponse.json(
        {
          error:
            "La activación requiere revisión. No vuelvas a intentarla todavía.",
        },
        { status: 500 }
      );
    }

    // Quitar el código temporal de los metadatos de Auth
    const { error: errorLimpiar } =
      await supabase.auth.admin.updateUserById(data.user.id, {
        user_metadata: {
          nombre: usuario.nombre,
          rol: usuario.rol,
          codigo_activacion: null,
        },
      });

    if (errorLimpiar) {
      console.error(
        "No se pudo limpiar el código temporal:",
        errorLimpiar.message
      );
    }

    return NextResponse.json({
      mensaje: "Cuenta activada correctamente.",
      id_usuario: perfil.id_usuario,
    });
  } catch (error) {
    console.error("Error de activación:", error.message);

    return NextResponse.json(
      { error: "No se pudo completar la activación." },
      { status: 500 }
    );
  }
}
