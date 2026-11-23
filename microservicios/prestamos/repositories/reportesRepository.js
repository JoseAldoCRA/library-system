
const crearClienteAutenticado = require("../supabaseAutenticado");

// Consultar registros en grupos de 500
async function consultarRegistros(tabla, columnas, campoOrden, token) {
  const supabase = crearClienteAutenticado(token);

  let resultados = [];
  let inicio = 0;
  const cantidad = 500;

  while (true) {
    const { data, error } = await supabase
      .from(tabla)
      .select(columnas)
      .order(campoOrden, { ascending: true })
      .range(inicio, inicio + cantidad - 1);

    if (error) {
      throw new Error(error.message);
    }

    resultados = resultados.concat(data);

    if (data.length < cantidad) {
      break;
    }

    inicio = inicio + cantidad;
  }

  return resultados;
}

// Obtener los préstamos para los reportes
async function obtenerPrestamosReporte(token) {
  return await consultarRegistros(
    "prestamos",
    "id_prestamo, fecha_vencimiento, fecha_devolucion",
    "id_prestamo",
    token
  );
}

// Obtener las sanciones para los reportes
async function obtenerSancionesReporte(token) {
  return await consultarRegistros(
    "sanciones",
    "id_sancion, estado_pago",
    "id_sancion",
    token
  );
}

module.exports = {
  obtenerPrestamosReporte,
  obtenerSancionesReporte,
};
