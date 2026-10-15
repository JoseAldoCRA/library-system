import { crearClienteSupabase } from "@/lib/supabaseClient";

export async function insertarEjemplar(ejemplar) {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("ejemplares")
    .insert([ejemplar])
    .select("id_ejemplar, id_libro, codigo, estado")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function obtenerEjemplares() {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("ejemplares")
    .select(`
      id_ejemplar,
      id_libro,
      codigo,
      estado,
      libros ( titulo, isbn,  categorias ( nombre ))
    `)
    .order("codigo", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function actualizarEstadoEjemplar(idEjemplar, nuevoEstado) {
  const supabase = crearClienteSupabase();

  const { error } = await supabase.rpc("cambiar_estado_ejemplar", {
    p_id_ejemplar: idEjemplar,
    p_nuevo_estado: nuevoEstado,
  });

  if (error) {
    throw new Error(error.message);
  }
}