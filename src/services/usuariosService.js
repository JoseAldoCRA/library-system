import { obtenerTodosUsuarios, insertarUsuario } from "@/repositories/usuariosRepository";

export async function listarUsuarios() {
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