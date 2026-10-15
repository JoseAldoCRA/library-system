import { insertarEjemplar, obtenerEjemplares, actualizarEstadoEjemplar, } from "@/repositories/ejemplaresRepository";

export async function registrarNuevoEjemplar(ejemplar) {
  const id_libro = Number(ejemplar.id_libro);
  const codigo = ejemplar.codigo.trim();

  if (!Number.isInteger(id_libro) || id_libro <= 0 || !codigo) {
    throw new Error("Selecciona un libro e ingresa el código del ejemplar.");
  }

  try {
    return await insertarEjemplar({
      id_libro,
      codigo,
      estado: "disponible"
    });
  } catch (error) {
    if (error.message.includes("ejemplares_codigo_key")) {
      throw new Error("Ya existe un ejemplar registrado con ese código.");
    }

    throw error;
  }
}

export async function listarEjemplares() {
  const ejemplares = await obtenerEjemplares();

  return ejemplares.map((ejemplar) => {
    return {
      id_ejemplar: ejemplar.id_ejemplar,
      id_libro: ejemplar.id_libro,
      codigo: ejemplar.codigo,
      estado: ejemplar.estado,
      titulo: ejemplar.libros?.titulo || "Libro no encontrado",
      isbn: ejemplar.libros?.isbn || "Sin ISBN",
      categoria: ejemplar.libros?.categorias?.nombre || "Sin categoría"
    };
  });
}

export async function cambiarEstadoEjemplar(idEjemplar, nuevoEstado) {
  const id = Number(idEjemplar);

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("El ejemplar seleccionado no es válido.");
  }

  if (nuevoEstado !== "baja" && nuevoEstado !== "disponible") {
    throw new Error("El estado solicitado no está permitido.");
  }

  try {
    await actualizarEstadoEjemplar(id, nuevoEstado);
  } catch (error) {
    throw new Error(error.message);
  }
}