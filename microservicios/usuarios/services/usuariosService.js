const {
  obtenerTodosUsuarios,
  crearCuentaUsuario,
} = require("../repositories/usuariosRepository");

async function listarUsuarios(token) {
  const usuarios = await obtenerTodosUsuarios(token);

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

function validarRegistroUsuario(datos) {
  const nombre =
    typeof datos?.nombre === "string"
      ? datos.nombre.trim()
      : "";

  const correo =
    typeof datos?.correo === "string"
      ? datos.correo.trim().toLowerCase()
      : "";

  const rol = datos?.rol;
  const contrasena = datos?.contrasena;

  if (!nombre || !correo || !rol || !contrasena) {
    throw new Error("Debes completar todos los campos.");
  }

  if (nombre.length > 100) {
    throw new Error("El nombre es demasiado largo.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    throw new Error("El correo electrónico no es válido.");
  }

  if (!["estudiante", "docente"].includes(rol)) {
    throw new Error("Solo puedes registrar estudiantes y docentes.");
  }

  if (
    typeof contrasena !== "string" ||
    contrasena.length < 8 ||
    contrasena.length > 72
  ) {
    throw new Error("La contraseña debe tener entre 8 y 72 caracteres.");
  }

  return {
    nombre,
    correo,
    rol,
    contrasena,
  };
}

async function registrarNuevoUsuario(datos) {
  // Validar la información recibida
  const usuario = validarRegistroUsuario(datos);

  // Crear la cuenta mediante el repositorio
  const resultado = await crearCuentaUsuario(usuario);

  return resultado;
}

module.exports = {
  listarUsuarios,
  validarRegistroUsuario,
  registrarNuevoUsuario,
};
