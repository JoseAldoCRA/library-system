const {
  insertarPrestamo,
  obtenerPrestamosActivos,
  devolverPrestamo,
  obtenerHistorialDevoluciones,
  obtenerMisPrestamos,
  crearSolicitudPrestamo,
  obtenerMisSolicitudes,
  cancelarSolicitudPrestamo
} = require("../repositories/prestamosRepository");

// Validar y registrar un nuevo préstamo
async function registrarNuevoPrestamo(prestamo, token) {
  const idUsuario = Number(prestamo?.id_usuario);
  const idEjemplar = Number(prestamo?.id_ejemplar);
  const fechaVencimiento = prestamo?.fecha_vencimiento;

  // Validar usuario
  if (!Number.isSafeInteger(idUsuario) || idUsuario <= 0) {
    throw new Error("Debes seleccionar un usuario válido.");
  }

  // Validar ejemplar
  if (!Number.isSafeInteger(idEjemplar) || idEjemplar <= 0) {
    throw new Error("Debes seleccionar un ejemplar válido.");
  }

  // Validar formato de fecha
  if (
    typeof fechaVencimiento !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(fechaVencimiento)
  ) {
    throw new Error("Debes seleccionar una fecha de vencimiento válida.");
  }

  const fecha = new Date(`${fechaVencimiento}T00:00:00Z`);

  if (
    Number.isNaN(fecha.getTime()) ||
    fecha.toISOString().slice(0, 10) !== fechaVencimiento
  ) {
    throw new Error("La fecha de vencimiento no es válida.");
  }

  // Ejecutar la función segura de PostgreSQL
  return await insertarPrestamo(
    {
      id_usuario: idUsuario,
      id_ejemplar: idEjemplar,
      fecha_vencimiento: fechaVencimiento
    },
    token
  );
}

 // Consultar y preparar los préstamos activos
async function listarPrestamosActivos(token) {
  const prestamos = await obtenerPrestamosActivos(token);

  return prestamos.map((prestamo) => {
    return {
      id_prestamo: prestamo.id_prestamo,
      usuario: prestamo.usuarios?.nombre || "Sin usuario",
      ejemplar: prestamo.ejemplares?.codigo || "Sin código",
      libro: prestamo.ejemplares?.libros?.titulo || "Sin título",
      fecha_prestamo: prestamo.fecha_prestamo,
      fecha_vencimiento: prestamo.fecha_vencimiento,
      estado: "Activo"
    };
  });
}
// Validar y registrar una devolución
async function registrarDevolucion(idPrestamo, token) {
  const id = Number(idPrestamo);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Debes seleccionar un préstamo válido.");
  }

  await devolverPrestamo(id, token);
}

// Consultar y preparar el historial de devoluciones
async function listarHistorialDevoluciones(token) {
  const prestamos = await obtenerHistorialDevoluciones(token);

  return prestamos.map((prestamo) => {
    return {
      id_prestamo: prestamo.id_prestamo,
      usuario: prestamo.usuarios?.nombre || "Sin usuario",
      ejemplar: prestamo.ejemplares?.codigo || "Sin código",
      libro: prestamo.ejemplares?.libros?.titulo || "Sin título",
      fecha_prestamo: prestamo.fecha_prestamo,
      fecha_vencimiento: prestamo.fecha_vencimiento,
      fecha_devolucion: prestamo.fecha_devolucion,
      estado: "Devuelto"
    };
  });
}

 // Consultar los préstamos del estudiante o docente autenticado
async function listarMisPrestamos(token, authUserId) {
  const prestamos = await obtenerMisPrestamos(token, authUserId);

  return prestamos.map((prestamo) => {
    return {
      id_prestamo: prestamo.id_prestamo,
      ejemplar: prestamo.ejemplares?.codigo || "Sin código",
      libro: prestamo.ejemplares?.libros?.titulo || "Sin título",
      fecha_prestamo: prestamo.fecha_prestamo,
      fecha_vencimiento: prestamo.fecha_vencimiento,
      fecha_devolucion: prestamo.fecha_devolucion,
      estado: prestamo.fecha_devolucion === null
        ? "Activo"
        : "Devuelto"
    };
  });
}

// Validar y crear una solicitud de préstamo
async function registrarSolicitudPrestamo(datos, token) {
  const idLibro = datos?.id_libro;

  if (!Number.isSafeInteger(idLibro) || idLibro <= 0) {
    const error = new Error("Debes seleccionar un libro válido.");
    error.status = 400;
    throw error;
  }

  return await crearSolicitudPrestamo(idLibro, token);
}

// Consultar las solicitudes del estudiante o docente autenticado
async function listarMisSolicitudes(token, authUserId) {
  return await obtenerMisSolicitudes(token, authUserId);
}

// Validar y cancelar una solicitud de préstamo
async function cancelarSolicitud(idSolicitud, token) {
  const id = Number(idSolicitud);

  if (!Number.isSafeInteger(id) || id <= 0) {
    const error = new Error("La solicitud seleccionada no es válida.");
    error.status = 400;
    throw error;
  }

  return await cancelarSolicitudPrestamo(id, token);
}

module.exports = {
  registrarNuevoPrestamo,
  listarPrestamosActivos,
  registrarDevolucion,
  listarHistorialDevoluciones,
  listarMisPrestamos,
  registrarSolicitudPrestamo,
  listarMisSolicitudes,
  cancelarSolicitud
};