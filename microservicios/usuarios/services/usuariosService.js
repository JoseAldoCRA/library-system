
const {
  obtenerTodosUsuarios,
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

module.exports = {
  listarUsuarios,
};
