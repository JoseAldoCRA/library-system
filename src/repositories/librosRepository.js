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
    resumen,
    id_categoria,
    categorias ( nombre ),
    ejemplares ( id_ejemplar, estado)
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


export async function actualizarLibro(idLibro, libro) {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("libros")
    .update(libro)
    .eq("id_libro", idLibro)
    .select("id_libro, isbn, titulo, autor, id_categoria")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}


export async function contarEjemplaresLibro(idLibro) {
  const supabase = crearClienteSupabase();

  const { count, error } = await supabase
    .from("ejemplares")
    .select("id_ejemplar", { count: "exact", head: true })
    .eq("id_libro", idLibro);

  if (error) {
    throw new Error(error.message);
  }

  return count;
}

export async function eliminarLibro(idLibro) {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("libros")
    .delete()
    .eq("id_libro", idLibro)
    .select("id_libro")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}


export async function obtenerLibroPorId(idLibro) {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("libros")
    .select(`
      id_libro,
      isbn,
      titulo,
      autor,
      resumen,
      id_categoria,
      categorias ( nombre ),
      ejemplares ( id_ejemplar, estado )
    `)
    .eq("id_libro", idLibro)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

