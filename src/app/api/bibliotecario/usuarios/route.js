import { NextResponse } from "next/server";

import { crearClienteSupabaseAdmin } from "@/lib/supabaseAdmin";
import { verificarBibliotecario } from "@/lib/verificarBibliotecario";

export async function POST(request) {
  // Solo el bibliotecario puede registrar cuentas desde este apartado
  try {
    await verificarBibliotecario(request);
  } catch (error) {
    console.error("Error al verificar bibliotecario:", error.message);

    return NextResponse.json(
      { error: "No tienes permisos de bibliotecario." },
      { status: 403 },
    );
  }
  let datos;

  try {
    datos = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Los datos enviados no son válidos." },
      { status: 400 },
    );
  }

  const nombre = typeof datos?.nombre === "string" ? datos.nombre.trim() : "";

  const correo =
    typeof datos?.correo === "string" ? datos.correo.trim().toLowerCase() : "";

  const rol = datos?.rol;
  const contrasena = datos?.contrasena;

  if (!nombre || !correo || !rol || !contrasena) {
    return NextResponse.json(
      { error: "Debes completar todos los campos." },
      { status: 400 },
    );
  }

  if (nombre.length > 100) {
    return NextResponse.json(
      { error: "El nombre es demasiado largo." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return NextResponse.json(
      { error: "El correo electrónico no es válido." },
      { status: 400 },
    );
  }

  if (rol !== "estudiante" && rol !== "docente") {
    return NextResponse.json(
      { error: "Solo puedes registrar estudiantes y docentes." },
      { status: 400 },
    );
  }

  if (
    typeof contrasena !== "string" ||
    contrasena.length < 8 ||
    contrasena.length > 72
  ) {
    return NextResponse.json(
      { error: "La contraseña debe tener entre 8 y 72 caracteres." },
      { status: 400 },
    );
  }

  try {
    const supabase = crearClienteSupabaseAdmin();

    // Crear la cuenta de acceso en Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: correo,
      password: contrasena,
      email_confirm: true,
      user_metadata: {
        nombre: nombre,
        rol: rol,
      },
    });

    if (error) {
      console.error("Error al crear usuario Auth:", error.message);

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!data.user) {
      throw new Error("No se pudo crear la cuenta.");
    }

    return NextResponse.json(
      {
        mensaje: "Cuenta creada correctamente.",
        id_auth: data.user.id,
        correo: data.user.email,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error al registrar usuario:", error.message);

    return NextResponse.json(
      { error: "No se pudo registrar la cuenta." },
      { status: 500 },
    );
  }
}


export async function PATCH(request) {
  // Verificar permisos del bibliotecario
  try {
    await verificarBibliotecario(request);
  } catch (error) {
    return NextResponse.json(
      { error: "No tienes permisos de bibliotecario." },
      { status: 403 }
    );
  }

  let datos;

  try {
    datos = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Los datos enviados no son válidos." },
      { status: 400 }
    );
  }

  const idUsuario = datos?.id_usuario;

  if (!Number.isSafeInteger(idUsuario) || idUsuario <= 0) {
    return NextResponse.json(
      { error: "El usuario seleccionado no es válido." },
      { status: 400 }
    );
  }

  const supabase = crearClienteSupabaseAdmin();

  try {
    // Consultar la información actual
    const { data: usuario, error: errorConsulta } = await supabase
      .from("usuarios")
      .select("id_usuario, nombre, correo, rol, estado, auth_user_id")
      .eq("id_usuario", idUsuario)
      .maybeSingle();

    if (errorConsulta) {
      throw errorConsulta;
    }

    if (!usuario) {
      return NextResponse.json(
        { error: "No se encontró el usuario." },
        { status: 404 }
      );
    }

    // No permitir editar al bibliotecario
    if (usuario.rol === "bibliotecario") {
      return NextResponse.json(
        { error: "No puedes editar cuentas de bibliotecarios." },
        { status: 403 }
      );
    }

    // Recibir los valores nuevos
    // Si el formulario no envía un campo, conservar el actual
    const nombre =
      datos.nombre === undefined
        ? usuario.nombre
        : typeof datos.nombre === "string"
          ? datos.nombre.trim()
          : "";

    const correo =
      datos.correo === undefined
        ? usuario.correo
        : typeof datos.correo === "string"
          ? datos.correo.trim().toLowerCase()
          : "";

    const rol = datos.rol === undefined ? usuario.rol : datos.rol;

    const estado =
      datos.estado === undefined ? usuario.estado : datos.estado;

    // Validar nombre
    if (!nombre || nombre.length > 100) {
      return NextResponse.json(
        { error: "Ingresa un nombre válido de máximo 100 caracteres." },
        { status: 400 }
      );
    }

    // Validar correo
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return NextResponse.json(
        { error: "El correo electrónico no es válido." },
        { status: 400 }
      );
    }

    // Validar rol
    if (!["estudiante", "docente"].includes(rol)) {
      return NextResponse.json(
        { error: "Solo puedes seleccionar estudiante o docente." },
        { status: 400 }
      );
    }

    // Validar estado
    if (!["activo", "inactivo"].includes(estado)) {
      return NextResponse.json(
        { error: "El estado debe ser activo o inactivo." },
        { status: 400 }
      );
    }

    // Comprobar que otro usuario no tenga el correo
    const { data: correoExistente, error: errorCorreo } = await supabase
      .from("usuarios")
      .select("id_usuario")
      .eq("correo", correo)
      .neq("id_usuario", idUsuario)
      .maybeSingle();

    if (errorCorreo) {
      throw errorCorreo;
    }

    if (correoExistente) {
      return NextResponse.json(
        { error: "El correo ya pertenece a otro usuario." },
        { status: 409 }
      );
    }

    // Preparar los cambios en Supabase Auth
    let cuentaAnterior = null;
    let cambiosAuth = {};
    let authModificado = false;

    const cambioCorreo = correo !== usuario.correo;
    const cambioEstado = estado !== usuario.estado;
    const cambioDatos =
      nombre !== usuario.nombre || rol !== usuario.rol;

    if (usuario.auth_user_id) {
      const { data: datosAuth, error: errorAuth } =
        await supabase.auth.admin.getUserById(usuario.auth_user_id);

      if (errorAuth || !datosAuth.user) {
        return NextResponse.json(
          { error: "No se encontró la cuenta de autenticación." },
          { status: 409 }
        );
      }

      cuentaAnterior = datosAuth.user;

      if (cambioCorreo) {
        cambiosAuth.email = correo;
        cambiosAuth.email_confirm = true;
      }

      if (cambioEstado) {
        cambiosAuth.ban_duration =
          estado === "inactivo" ? "876000h" : "none";
      }

      if (cambioDatos) {
        cambiosAuth.user_metadata = {
          ...cuentaAnterior.user_metadata,
          nombre: nombre,
          rol: rol,
        };
      }

      // Actualizar Auth solamente cuando sea necesario
      if (Object.keys(cambiosAuth).length > 0) {
        const { error: errorActualizarAuth } =
          await supabase.auth.admin.updateUserById(
            usuario.auth_user_id,
            cambiosAuth
          );

        if (errorActualizarAuth) {
          console.error(
            "Error al actualizar Supabase Auth:",
            errorActualizarAuth.message
          );

          return NextResponse.json(
            { error: "No se pudo actualizar la cuenta de acceso. Revisa el correo y los datos." },
            { status: 400 }
          );
        }

        authModificado = true;
      }
    }

    // Actualizar la tabla de usuarios
    const { data: actualizado, error: errorActualizar } = await supabase
      .from("usuarios")
      .update({
        nombre: nombre,
        correo: correo,
        rol: rol,
        estado: estado,
      })
      .eq("id_usuario", idUsuario)
      .in("rol", ["estudiante", "docente"])
      .select("id_usuario, nombre, correo, rol, estado")
      .single();

    if (errorActualizar) {
      // Intentar restaurar Auth si falló la base de datos
      if (authModificado) {
        const restaurar = {};

        if (cambioCorreo) {
          restaurar.email = cuentaAnterior.email;
          restaurar.email_confirm = true;
        }

        if (cambioEstado) {
          restaurar.ban_duration =
            usuario.estado === "inactivo" ? "876000h" : "none";
        }

        if (cambioDatos) {
          restaurar.user_metadata = cuentaAnterior.user_metadata || {};
        }

        const { error: errorRestaurar } =
          await supabase.auth.admin.updateUserById(
            usuario.auth_user_id,
            restaurar
          );

        if (errorRestaurar) {
          console.error(
            "No se pudo restaurar Supabase Auth:",
            errorRestaurar.message
          );

          return NextResponse.json(
            { error: "La actualización fue parcial. Revisa la cuenta en Supabase antes de volver a intentarlo." },
            { status: 500 }
          );
        }
      }

      if (errorActualizar.code === "23505") {
        return NextResponse.json(
          { error: "El correo ya está registrado." },
          { status: 409 }
        );
      }

      throw errorActualizar;
    }

    return NextResponse.json({
      mensaje: "Usuario actualizado correctamente.",
      usuario: actualizado,
    });
  } catch (error) {
    console.error("Error al editar usuario:", error);

    return NextResponse.json(
      { error: "No se pudo actualizar el usuario." },
      { status: 500 }
    );
  }
}
