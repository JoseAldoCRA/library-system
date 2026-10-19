import { obtenerSanciones, obtenerMisSanciones, registrarPagoSancion, } from "@/repositories/sancionesRepository";

export async function listarSanciones() {
  const sanciones = await obtenerSanciones();

  return sanciones.map((sancion) => {
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
  });
}

export async function registrarNuevoPago(idSancion) {
  const id = Number(idSancion);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Debes seleccionar una sanción válida.");
  }

  await registrarPagoSancion(id);
}

export async function listarMisSanciones() {
  const sanciones = await obtenerMisSanciones();

  return sanciones.map((sancion) => {
    return {
      id_sancion: sancion.id_sancion,
      id_prestamo: sancion.id_prestamo,
      libro: sancion.prestamos?.ejemplares?.libros?.titulo || "Sin título",
      ejemplar: sancion.prestamos?.ejemplares?.codigo || "Sin código",
      fecha_vencimiento: sancion.prestamos?.fecha_vencimiento,
      fecha_devolucion: sancion.prestamos?.fecha_devolucion,
      dias_retraso: sancion.dias_retraso,
      monto: Number(sancion.monto),
      estado_pago: sancion.estado_pago,
    };
  });
}
