// import { obtenerTodosUsuarios, insertarUsuario } from "@/repositories/usuariosRepository";
import { insertarUsuario } from "@/repositories/usuariosRepository";
import { crearClienteSupabase } from "@/lib/supabaseClient";

/* export async function listarUsuarios() {
  const usuarios = await obtenerTodosUsuarios();

  return usuarios.map((usuario) => {
    return {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado,
      autenticacion: usuario.auth_user_id
        ? "Vinculado con Auth"
        : "Sin cuenta Auth",
      tieneCuenta: Boolean(usuario.auth_user_id),
    };
  });
} */

export async function listarUsuarios() {
  const supabase = crearClienteSupabase();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Debes iniciar sesión como bibliotecario.");
  }

  const respuesta = await fetch("http://localhost:4004/api/usuarios", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.error || "No se pudieron consultar los usuarios."
    );
  }

  return datos;
}

export async function registrarNuevoUsuario(usuario) {
  const nombre = usuario.nombre.trim();
  const correo = usuario.correo.trim().toLowerCase();
  const rol = usuario.rol;

  // Validar nombre
  if (!nombre) {
    throw new Error("Debes ingresar el nombre del usuario.");
  }

  // Validar correo
  if (!correo) {
    throw new Error("Debes ingresar el correo electrónico.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    throw new Error("El correo electrónico no es válido.");
  }

  // Validar rol
  if (rol !== "estudiante" && rol !== "docente") {
    throw new Error("Debes seleccionar estudiante o docente.");
  }

  const datos = {
    nombre: nombre,
    correo: correo,
    rol: rol,
    estado: "activo",
  };

  try {
    return await insertarUsuario(datos);
  } catch (error) {
    if (
      error.message.includes("usuarios_correo_key") ||
      error.message.includes("duplicate key")
    ) {
      throw new Error("Ya existe un usuario con ese correo.");
    }

    throw error;
  }
}