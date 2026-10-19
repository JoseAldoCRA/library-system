
import {
  obtenerPrestamosReporte,
  obtenerSancionesReporte,
  obtenerEjemplaresReporte,
} from "@/repositories/reportesRepository";

export async function generarReporteBiblioteca() {
  // Obtener la informacion de Supabase
  const prestamos = await obtenerPrestamosReporte();
  const sanciones = await obtenerSancionesReporte();
  const ejemplares = await obtenerEjemplaresReporte();

  // Obtener la fecha actual en formato YYYY-MM-DD
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  const fechaActual = `${anio}-${mes}-${dia}`;

  // Reporte de prestamos
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

  // Reporte de sanciones
  const totalSanciones = sanciones.length;

  const sancionesPendientes = sanciones.filter(
    (sancion) => sancion.estado_pago === "pendiente"
  ).length;

  const sancionesPagadas = sanciones.filter(
    (sancion) => sancion.estado_pago === "pagado"
  ).length;

  // Reporte de inventario
  const totalEjemplares = ejemplares.length;

  const ejemplaresDisponibles = ejemplares.filter(
    (ejemplar) => ejemplar.estado === "disponible"
  ).length;

  const ejemplaresPrestados = ejemplares.filter(
    (ejemplar) => ejemplar.estado === "prestado"
  ).length;

  // Entregar los resultados
  return {
    totalPrestamos,
    prestamosActivos,
    prestamosDevueltos,
    prestamosVencidos,
    totalSanciones,
    sancionesPendientes,
    sancionesPagadas,
    totalEjemplares,
    ejemplaresDisponibles,
    ejemplaresPrestados,
  };
}
