
const {
  obtenerSanciones,
  obtenerMisSanciones,
  registrarPagoSancion,
} = require("../repositories/sancionesRepository");

// Dar formato a los datos de una sanción
function formatearSancion(sancion) {
  return {
    id_sancion: sancion.id_sancion,
    id_prestamo: sancion.id_prestamo,
    usuario: sancion.prestamos?.usuarios?.nombre || "Sin usuario",
    ejemplar: sancion.prestamos?.ejemplares?.codigo || "Sin código",
    libro: sancion.prestamos?.ejemplares?.libros?.titulo || "Sin título",
    fecha_vencimiento: sancion.prestamos?.fecha_vencimiento,
    fecha_devolucion: sancion.prestamos?.fecha_devolucion,
    dias_retraso: sancion.dias_retraso,
    monto: Number(sancion.monto),
    estado_pago: sancion.estado_pago,
  };
}

// Consultar todas las sanciones
async function listarSanciones(token) {
  const sanciones = await obtenerSanciones(token);

  return sanciones.map(formatearSancion);
}

// Consultar las sanciones del usuario autenticado
async function listarMisSanciones(token, idUsuario) {
  const sanciones = await obtenerMisSanciones(token, idUsuario);

  return sanciones.map(formatearSancion);
}

// Registrar el pago de una sanción
async function registrarNuevoPago(idSancion, token) {
  const id = Number(idSancion);

  if (!Number.isSafeInteger(id) || id <= 0) {
    const error = new Error("Debes seleccionar una sanción válida.");
    error.status = 400;
    throw error;
  }

  await registrarPagoSancion(id, token);
}

module.exports = {
  listarSanciones,
  listarMisSanciones,
  registrarNuevoPago,
};
