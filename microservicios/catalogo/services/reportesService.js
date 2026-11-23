
const {
  obtenerEjemplaresReporte,
} = require("../repositories/reportesRepository");

// Generar las estadísticas del inventario
async function generarReporteInventario(token) {
  const ejemplares = await obtenerEjemplaresReporte(token);

  // Total de ejemplares registrados
  const totalEjemplares = ejemplares.length;

  // Ejemplares disponibles
  const ejemplaresDisponibles = ejemplares.filter(
    (ejemplar) => ejemplar.estado === "disponible"
  ).length;

  // Ejemplares prestados
  const ejemplaresPrestados = ejemplares.filter(
    (ejemplar) => ejemplar.estado === "prestado"
  ).length;

  return {
    totalEjemplares,
    ejemplaresDisponibles,
    ejemplaresPrestados,
  };
}

module.exports = {
  generarReporteInventario,
};
