
const crearClienteAutenticado = require("../supabaseAutenticado");

// Registrar un préstamo utilizando el token del bibliotecario
async function insertarPrestamo(prestamo, token) {
  const supabase = crearClienteAutenticado(token);

  const { data, error } = await supabase.rpc(
    "registrar_prestamo",
    {
      p_id_usuario: prestamo.id_usuario,
      p_id_ejemplar: prestamo.id_ejemplar,
      p_fecha_vencimiento: prestamo.fecha_vencimiento
    }
  );

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

 // Consultar los préstamos activos
async function obtenerPrestamosActivos(token) {
  const supabase = crearClienteAutenticado(token);

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
// Registrar una devolución utilizando el token del bibliotecario
async function devolverPrestamo(idPrestamo, token) {
  const supabase = crearClienteAutenticado(token);

  const { error } = await supabase.rpc("registrar_devolucion", {
    p_id_prestamo: idPrestamo
  });

  if (error) {
    throw new Error(error.message);
  }
}

// Consultar el historial de préstamos devueltos
async function obtenerHistorialDevoluciones(token) {
  const supabase = crearClienteAutenticado(token);

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
    .not("fecha_devolucion", "is", null)
    .order("fecha_devolucion", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

 // Consultar los préstamos del usuario autenticado
async function obtenerMisPrestamos(token, authUserId) {
  const supabase = crearClienteAutenticado(token);

  // Consultar el perfil del usuario
  const { data: perfil, error: errorPerfil } = await supabase
    .from("usuarios")
    .select("id_usuario, rol, estado")
    .eq("auth_user_id", authUserId)
    .single();

  if (errorPerfil || !perfil) {
    throw new Error("No se pudo consultar el perfil del usuario.");
  }

  if (
    perfil.estado !== "activo" ||
    !["estudiante", "docente"].includes(perfil.rol)
  ) {
    throw new Error("No tienes permiso para consultar préstamos.");
  }

  // Obtener únicamente sus préstamos
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

module.exports = {
  insertarPrestamo,
  obtenerPrestamosActivos,
  devolverPrestamo,
  obtenerHistorialDevoluciones,
  obtenerMisPrestamos
};