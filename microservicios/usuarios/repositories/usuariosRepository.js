
const crearClienteAutenticado = require("../supabaseAutenticado");

async function obtenerTodosUsuarios(token) {
  const supabase = crearClienteAutenticado(token);

  const { data, error } = await supabase
    .from("usuarios")
    .select(`
      id_usuario,
      nombre,
      correo,
      rol,
      estado,
      auth_user_id
    `)
    .order("id_usuario", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

module.exports = {
  obtenerTodosUsuarios,
};
