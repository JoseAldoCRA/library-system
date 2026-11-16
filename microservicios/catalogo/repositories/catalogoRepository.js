
const supabase = require("../supabaseClient");

// Obtener todas las categorías
async function obtenerCategorias() {
  const { data, error } = await supabase
    .from("categorias")
    .select("id_categoria, nombre")
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

module.exports = {
  obtenerCategorias
};
