import { crearClienteSupabase } from "@/lib/supabaseClient";

export async function insertarPrestamo(prestamo) {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase.rpc("registrar_prestamo", {
    p_id_usuario: prestamo.id_usuario,
    p_id_ejemplar: prestamo.id_ejemplar,
    p_fecha_vencimiento: prestamo.fecha_vencimiento,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function obtenerPrestamosActivos() {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("prestamos")
    .select(`
      id_prestamo,
      fecha_prestamo,
      fecha_vencimiento,
      fecha_devolucion,
      usuarios (
        nombre
      ),
      ejemplares (
        codigo,
        libros (
          titulo
        )
      )
    `)
    .is("fecha_devolucion", null)
    .order("fecha_vencimiento", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function devolverPrestamo(idPrestamo) {
  const supabase = crearClienteSupabase();

  const { error } = await supabase.rpc("registrar_devolucion", {
    p_id_prestamo: idPrestamo,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function obtenerMisPrestamos() {
  const supabase = crearClienteSupabase();

  // Obtener el usuario que inició sesión
  const {
    data: { user },
    error: errorSesion,
  } = await supabase.auth.getUser();

  if (errorSesion || !user) {
    throw new Error("Debes iniciar sesión.");
  }

  // Consultar su perfil
  const { data: perfil, error: errorPerfil } = await supabase
    .from("usuarios")
    .select("id_usuario, rol, estado")
    .eq("auth_user_id", user.id)
    .single();

  if (
    errorPerfil ||
    !perfil ||
    perfil.estado !== "activo" ||
    !["estudiante", "docente"].includes(perfil.rol)
  ) {
    throw new Error("No tienes permiso para consultar préstamos.");
  }

  // Consultar solamente sus préstamos
  const { data, error } = await supabase
    .from("prestamos")
    .select(`
      id_prestamo,
      fecha_prestamo,
      fecha_vencimiento,
      fecha_devolucion,
      ejemplares (
        codigo,
        libros (
          titulo
        )
      )
    `)
    .eq("id_usuario", perfil.id_usuario)
    .order("fecha_prestamo", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}