const {
  obtenerCategorias,
  obtenerLibros,
  obtenerEjemplares,
  obtenerEjemplaresDisponibles,
  insertarLibro,
  actualizarLibro,
  contarEjemplaresLibro,
  eliminarLibro,
  insertarEjemplar,
  actualizarEstadoEjemplar
} = require("../repositories/catalogoRepository");

// Consultar las categorías de la biblioteca
async function listarCategorias() {
  return await obtenerCategorias();
}

// Consultar los libros y calcular sus ejemplares
async function listarLibros() {
  const libros = await obtenerLibros();

  return libros.map((libro) => {
    const ejemplares = libro.ejemplares || [];

    const disponibles = ejemplares.filter(
      (ejemplar) => ejemplar.estado === "disponible",
    ).length;

    return {
      id_libro: libro.id_libro,
      isbn: libro.isbn,
      titulo: libro.titulo,
      autor: libro.autor,
      id_categoria: libro.id_categoria,
      categoria: libro.categorias?.nombre || "Sin categoría",
      disponibles: disponibles,
      total: ejemplares.length,
    };
  });
}

// Consultar todos los ejemplares registrados
async function listarEjemplares() {
  const ejemplares = await obtenerEjemplares();

  return ejemplares.map((ejemplar) => {
    return {
      id_ejemplar: ejemplar.id_ejemplar,
      id_libro: ejemplar.id_libro,
      codigo: ejemplar.codigo,
      estado: ejemplar.estado,
      titulo: ejemplar.libros?.titulo || "Libro no encontrado",
      isbn: ejemplar.libros?.isbn || "Sin ISBN",
      categoria: ejemplar.libros?.categorias?.nombre || "Sin categoría",
    };
  });
}

// Consultar solamente los ejemplares disponibles
async function listarEjemplaresDisponibles() {
  return await obtenerEjemplaresDisponibles();
}

 // Registrar un nuevo libro
async function registrarNuevoLibro(libro, token) {
  const isbn = libro.isbn?.trim();
  const titulo = libro.titulo?.trim();
  const autor = libro.autor?.trim();
  const id_categoria = Number(libro.id_categoria);

  if (
    !isbn ||
    !titulo ||
    !autor ||
    !Number.isInteger(id_categoria) ||
    id_categoria <= 0
  ) {
    throw new Error("Completa correctamente todos los campos.");
  }

  if (isbn.length > 30) {
    throw new Error("El ISBN no puede superar 30 caracteres.");
  }

  try {
    return await insertarLibro(
      {
        isbn,
        titulo,
        autor,
        id_categoria
      },
      token
    );
  } catch (error) {
    if (error.message.includes("libros_isbn_key")) {
      throw new Error("Ya existe un libro registrado con ese ISBN.");
    }

    throw error;
  }
}

 // Editar la información de un libro existente
async function editarLibro(idLibro, libro, token) {
  const id = Number(idLibro);
  const isbn = libro?.isbn?.trim();
  const titulo = libro?.titulo?.trim();
  const autor = libro?.autor?.trim();
  const id_categoria = Number(libro?.id_categoria);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("El libro seleccionado no es válido.");
  }

  if (
    !isbn ||
    !titulo ||
    !autor ||
    !Number.isInteger(id_categoria) ||
    id_categoria <= 0
  ) {
    throw new Error("Completa correctamente todos los campos.");
  }

  if (isbn.length > 30) {
    throw new Error("El ISBN no puede superar 30 caracteres.");
  }

  try {
    return await actualizarLibro(
      id,
      {
        isbn,
        titulo,
        autor,
        id_categoria
      },
      token
    );
  } catch (error) {
    if (error.message.includes("libros_isbn_key")) {
      throw new Error("Ya existe otro libro registrado con ese ISBN.");
    }

    throw error;
  }
}

 // Eliminar un libro solamente si no tiene ejemplares
async function eliminarLibroSeguro(idLibro, token) {
  const id = Number(idLibro);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("El libro seleccionado no es válido.");
  }

  const cantidadEjemplares = await contarEjemplaresLibro(id, token);

  if (cantidadEjemplares === null) {
    throw new Error("No se pudo comprobar la cantidad de ejemplares.");
  }

  if (cantidadEjemplares > 0) {
    throw new Error(
      "No se puede eliminar el libro porque tiene ejemplares registrados."
    );
  }

  try {
    return await eliminarLibro(id, token);
  } catch (error) {
    if (
      error.message.includes("foreign key constraint") ||
      error.message.includes("violates foreign key")
    ) {
      throw new Error(
        "No se puede eliminar el libro porque tiene registros relacionados."
      );
    }

    throw error;
  }
}

 // Registrar un nuevo ejemplar
async function registrarNuevoEjemplar(ejemplar, token) {
  const id_libro = Number(ejemplar?.id_libro);
  const codigo =
    typeof ejemplar?.codigo === "string"
      ? ejemplar.codigo.trim()
      : "";

  if (!Number.isInteger(id_libro) || id_libro <= 0 || !codigo) {
    throw new Error(
      "Selecciona un libro e ingresa el código del ejemplar."
    );
  }

  try {
    return await insertarEjemplar(
      {
        id_libro,
        codigo,
        estado: "disponible"
      },
      token
    );
  } catch (error) {
    if (error.message.includes("ejemplares_codigo_key")) {
      throw new Error(
        "Ya existe un ejemplar registrado con ese código."
      );
    }

    throw error;
  }
}

 // Cambiar el estado de un ejemplar
async function cambiarEstadoEjemplar(idEjemplar, nuevoEstado, token) {
  const id = Number(idEjemplar);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("El ejemplar seleccionado no es válido.");
  }

  if (nuevoEstado !== "baja" && nuevoEstado !== "disponible") {
    throw new Error("El estado solicitado no está permitido.");
  }

  await actualizarEstadoEjemplar(id, nuevoEstado, token);
}

module.exports = {
  listarCategorias,
  listarLibros,
  listarEjemplares,
  listarEjemplaresDisponibles,
  registrarNuevoLibro,
  editarLibro,
  eliminarLibroSeguro,
  registrarNuevoEjemplar,
  cambiarEstadoEjemplar
};