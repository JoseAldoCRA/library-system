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
