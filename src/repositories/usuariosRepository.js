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

export async function obtenerTodosUsuarios() {
  const supabase = crearClienteSupabase();

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

export async function insertarUsuario(usuario) {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("usuarios")
    .insert([usuario])
    .select("id_usuario, nombre, correo, rol, estado")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}