import { crearClienteSupabase } from "@/lib/supabaseClient";

export async function iniciarSesion(correo, contrasena) {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (error) {
    return {
      exito: false,
      mensaje: "Correo o contraseña incorrectos",
    };
  }

  let respuesta;

  try {
    respuesta = await fetch("http://localhost:4004/api/usuarios/perfil", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
      },
      cache: "no-store",
    });
  } catch (error) {
    console.error("Error al conectar con el microservicio:", error.message);

    await supabase.auth.signOut();

    return {
      exito: false,
      mensaje: "No se pudo conectar con el servicio de usuarios.",
    };
  }

  if (!respuesta.ok) {
    await supabase.auth.signOut();

    return {
      exito: false,
      mensaje:
        respuesta.status === 403
          ? "Tu usuario no tiene un perfil activo"
          : "No se pudo verificar el perfil del usuario.",
    };
  }

  const perfil = await respuesta.json();

  return {
    exito: true,
    usuario: perfil,
  };
}

export async function registrarCuenta(nombre, correo, contrasena, rol) {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase.auth.signUp({
    email: correo.trim().toLowerCase(),
    password: contrasena,
    options: {
      data: {
        nombre: nombre.trim(),
        rol: rol,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("No se pudo crear la cuenta.");
  }

  return {
    requiereConfirmacion: !data.session,
  };
}

export async function obtenerUsuarioActual() {
  const supabase = crearClienteSupabase();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  try {
    const respuesta = await fetch("http://localhost:4004/api/usuarios/perfil", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    });

    if (!respuesta.ok) {
      return null;
    }

    const perfil = await respuesta.json();

    return perfil;
  } catch (error) {
    console.error("Error al consultar el perfil:", error.message);
    return null;
  }
}
