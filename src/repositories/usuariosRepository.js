import { crearClienteSupabase } from "@/lib/supabaseClient";

export async function obtenerUsuariosPrestamo() {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("usuarios")
    .select("id_usuario, nombre, rol")
    .eq("estado", "activo")
    .in("rol", ["estudiante", "docente"])
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}