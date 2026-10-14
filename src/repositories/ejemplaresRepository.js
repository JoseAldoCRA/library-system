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
