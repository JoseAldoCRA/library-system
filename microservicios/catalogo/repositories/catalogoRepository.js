const supabase = require("../supabaseClient");
const crearClienteAutenticado = require("../supabaseAutenticado");

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

 // Obtener todos los ejemplares registrados
async function obtenerEjemplares() {
  const { data, error } = await supabase
    .from("ejemplares")
    .select(`
      id_ejemplar,
      id_libro,
      codigo,
      estado,
      libros (
        titulo,
        isbn,
        categorias ( nombre )
      )
    `)
    .order("codigo", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Obtener solamente los ejemplares disponibles
async function obtenerEjemplaresDisponibles() {
  const { data, error } = await supabase
    .from("ejemplares")
    .select(`
      id_ejemplar,
      codigo,
      estado,
      libros (
        titulo,
        isbn
      )
    `)
    .eq("estado", "disponible")
    .order("codigo", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

 // Registrar un libro utilizando el token del bibliotecario
async function insertarLibro(libro, token) {
  const supabaseAutenticado = crearClienteAutenticado(token);

  const { data, error } = await supabaseAutenticado
    .from("libros")
    .insert([libro])
    .select("id_libro, isbn, titulo, autor, id_categoria")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

module.exports = {
  obtenerCategorias,
  obtenerLibros,
  obtenerEjemplares,
  obtenerEjemplaresDisponibles,
  insertarLibro
};