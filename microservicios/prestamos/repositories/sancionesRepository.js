
const crearClienteAutenticado = require("../supabaseAutenticado");

// Consultar todas las sanciones (bibliotecario)
async function obtenerSanciones(token) {
  const supabase = crearClienteAutenticado(token);

  const { data, error } = await supabase
    .from("sanciones")
    .select(`
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
    `)
    .order("id_sancion", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Consultar las sanciones del estudiante o docente autenticado
async function obtenerMisSanciones(token, idUsuario) {
  const supabase = crearClienteAutenticado(token);

  const { data, error } = await supabase
    .from("sanciones")
    .select(`
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
    `)
    .eq("prestamos.id_usuario", idUsuario)
    .order("id_sancion", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Registrar el pago de una sanción (bibliotecario)
async function registrarPagoSancion(idSancion, token) {
  const supabase = crearClienteAutenticado(token);

  const { error } = await supabase.rpc("registrar_pago_sancion", {
    p_id_sancion: idSancion,
  });

  if (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  obtenerSanciones,
  obtenerMisSanciones,
  registrarPagoSancion,
};
