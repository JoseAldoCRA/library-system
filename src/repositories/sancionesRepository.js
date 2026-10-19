import { crearClienteSupabase } from "@/lib/supabaseClient";

export async function obtenerSanciones() {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("sanciones")
    .select(
      `
      id_sancion,
      id_prestamo,
      dias_retraso,
      monto,
      estado_pago,
      prestamos (
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
      )
    `,
    )
    .order("id_sancion", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function obtenerMisSanciones() {
  const supabase = crearClienteSupabase();

  // Comprobar quién inició sesión
  const {
    data: { user },
    error: errorSesion,
  } = await supabase.auth.getUser();

  if (errorSesion || !user) {
    throw new Error("Debes iniciar sesión.");
  }

  // Consultar el perfil del usuario
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
    throw new Error("No tienes permiso para consultar sanciones.");
  }

  // Consultar únicamente sus sanciones
  const { data, error } = await supabase
    .from("sanciones")
    .select(
      `
      id_sancion,
      id_prestamo,
      dias_retraso,
      monto,
      estado_pago,
      prestamos!inner (
        id_usuario,
        fecha_vencimiento,
        fecha_devolucion,
        ejemplares (
          codigo,
          libros (
            titulo
          )
        )
      )
    `,
    )
    .eq("prestamos.id_usuario", perfil.id_usuario)
    .order("id_sancion", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function registrarPagoSancion(idSancion) {
  const supabase = crearClienteSupabase();

  const { error } = await supabase.rpc("registrar_pago_sancion", {
    p_id_sancion: idSancion,
  });

  if (error) {
    throw new Error(error.message);
  }
}
