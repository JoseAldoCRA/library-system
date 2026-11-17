const {
  obtenerCategorias,
  obtenerLibros,
  obtenerEjemplares,
  obtenerEjemplaresDisponibles,
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

module.exports = {
  listarCategorias,
  listarLibros,
  listarEjemplares,
  listarEjemplaresDisponibles
};
