import { insertarPrestamo, obtenerPrestamosActivos, } from "@/repositories/prestamosRepository";


export async function registrarNuevoPrestamo(prestamo) {
  const idUsuario = Number(prestamo.id_usuario);
  const idEjemplar = Number(prestamo.id_ejemplar);
  const fechaVencimiento = prestamo.fecha_vencimiento;

  if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
    throw new Error("Debes seleccionar un usuario válido.");
  }

  if (!Number.isInteger(idEjemplar) || idEjemplar <= 0) {
    throw new Error("Debes seleccionar un ejemplar válido.");
  }

  if (!fechaVencimiento) {
    throw new Error("Debes seleccionar la fecha de vencimiento.");
  }

  const fechaActual = new Date().toLocaleDateString("en-CA");

  if (fechaVencimiento < fechaActual) {
    throw new Error("La fecha de vencimiento no puede ser anterior a hoy.");
  }

  const datos = {
    id_usuario: idUsuario,
    id_ejemplar: idEjemplar,
    fecha_vencimiento: fechaVencimiento,
  };

  return await insertarPrestamo(datos);
}

export async function listarPrestamosActivos() {
  const prestamos = await obtenerPrestamosActivos();

  return prestamos.map((prestamo) => {
    return {
      id_prestamo: prestamo.id_prestamo,
      usuario: prestamo.usuarios?.nombre || "Sin usuario",
      ejemplar: prestamo.ejemplares?.codigo || "Sin código",
      libro: prestamo.ejemplares?.libros?.titulo || "Sin título",
      fecha_prestamo: prestamo.fecha_prestamo,
      fecha_vencimiento: prestamo.fecha_vencimiento,
      estado: "Activo",
    };
  });
}