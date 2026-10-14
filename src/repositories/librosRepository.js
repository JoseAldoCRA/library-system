import { crearClienteSupabase } from "@/lib/supabaseClient";

export async function obtenerLibros() {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("libros")
    .select(`
      id_libro,
      isbn,
      titulo,
      autor,
      categorias (
        nombre
      ),
      ejemplares (
        id_ejemplar,
        estado
      )
    `)
    .order("id_libro", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}


export async function obtenerCategorias() {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("categorias")
    .select("id_categoria, nombre")
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}


export async function insertarLibro(libro) {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("libros")
    .insert([libro])
    .select("id_libro, isbn, titulo, autor, id_categoria")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
