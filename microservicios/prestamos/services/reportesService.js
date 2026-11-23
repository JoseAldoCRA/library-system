
const {
  obtenerPrestamosReporte,
  obtenerSancionesReporte,
} = require("../repositories/reportesRepository");

// Generar las estadísticas de préstamos y sanciones
async function generarReportePrestamos(token) {
  const prestamos = await obtenerPrestamosReporte(token);
  const sanciones = await obtenerSancionesReporte(token);

  // Obtener la fecha actual en formato YYYY-MM-DD
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  const fechaActual = `${anio}-${mes}-${dia}`;

  // Estadísticas de préstamos
  const totalPrestamos = prestamos.length;

  const prestamosActivos = prestamos.filter(
    (prestamo) => prestamo.fecha_devolucion === null
  ).length;

  const prestamosDevueltos = prestamos.filter(
    (prestamo) => prestamo.fecha_devolucion !== null
  ).length;

  const prestamosVencidos = prestamos.filter(
    (prestamo) =>
      prestamo.fecha_devolucion === null &&
      prestamo.fecha_vencimiento < fechaActual
  ).length;

  // Estadísticas de sanciones
  const totalSanciones = sanciones.length;

  const sancionesPendientes = sanciones.filter(
    (sancion) => sancion.estado_pago === "pendiente"
  ).length;

  const sancionesPagadas = sanciones.filter(
    (sancion) => sancion.estado_pago === "pagado"
  ).length;

  return {
    totalPrestamos,
    prestamosActivos,
    prestamosDevueltos,
    prestamosVencidos,
    totalSanciones,
    sancionesPendientes,
    sancionesPagadas,
  };
}

module.exports = {
  generarReportePrestamos,
};
