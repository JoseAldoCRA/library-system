
const crearClienteAutenticado = require("../supabaseAutenticado");

// Obtener los ejemplares en grupos de 500
async function obtenerEjemplaresReporte(token) {
  const supabase = crearClienteAutenticado(token);

  let resultados = [];
  let inicio = 0;
  const cantidad = 500;

  while (true) {
    const { data, error } = await supabase
      .from("ejemplares")
      .select("id_ejemplar, estado")
      .order("id_ejemplar", { ascending: true })
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

module.exports = {
  obtenerEjemplaresReporte,
};
