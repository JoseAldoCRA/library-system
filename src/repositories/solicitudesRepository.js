
import { crearClienteSupabase } from "@/lib/supabaseClient";

export async function crearSolicitudPrestamo(idLibro) {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase.rpc(
    "crear_solicitud_prestamo",
    {
      p_id_libro: Number(idLibro),
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}


export async function obtenerMisSolicitudes() {
  const supabase = crearClienteSupabase();

  const { data: usuario, error: errorAuth } =
    await supabase.auth.getUser();

  if (errorAuth || !usuario.user) {
    throw new Error("Debes iniciar sesión.");
  }

  const { data: perfil, error: errorPerfil } = await supabase
    .from("usuarios")
    .select("id_usuario")
    .eq("auth_user_id", usuario.user.id)
    .single();

  if (errorPerfil || !perfil) {
    throw new Error("No se encontró tu usuario.");
  }

  const { data, error } = await supabase
    .from("solicitudes_prestamo")
    .select(`
      id_solicitud,
      fecha_solicitud,
      estado,
      libros (
        titulo,
        autor,
        isbn
      )
    `)
    .eq("id_usuario", perfil.id_usuario)
    .order("fecha_solicitud", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}


export async function cancelarSolicitudPrestamo(idSolicitud) {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase.rpc(
    "cancelar_solicitud_prestamo",
    {
      p_id_solicitud: Number(idSolicitud),
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

