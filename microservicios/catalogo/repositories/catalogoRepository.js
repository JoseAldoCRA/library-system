
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

// Obtener los libros con sus categorías y ejemplares
async function obtenerLibros() {
  const { data, error } = await supabase
    .from("libros")
    .select(`
      id_libro,
      isbn,
      titulo,
      autor,
      resumen,
      portada_url,
      id_categoria,
      categorias ( nombre ),
      ejemplares ( id_ejemplar, estado )
    `)
    .order("id_libro", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

module.exports = {
  obtenerCategorias,
  obtenerLibros
};
