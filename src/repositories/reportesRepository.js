
import { crearClienteSupabase } from "@/lib/supabaseClient";

// Obtener todos los registros por grupos
async function consultarRegistros(tabla, columnas, campoOrden) {
  const supabase = crearClienteSupabase();

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

// Obtener los prestamos para los reportes
export async function obtenerPrestamosReporte() {
  return await consultarRegistros(
    "prestamos",
    "id_prestamo, fecha_vencimiento, fecha_devolucion",
    "id_prestamo"
  );
}

// Obtener las sanciones para los reportes
export async function obtenerSancionesReporte() {
  return await consultarRegistros(
    "sanciones",
    "id_sancion, estado_pago",
    "id_sancion"
  );
}

// Obtener los ejemplares para los reportes
export async function obtenerEjemplaresReporte() {
  return await consultarRegistros(
    "ejemplares",
    "id_ejemplar, estado",
    "id_ejemplar"
  );
}
