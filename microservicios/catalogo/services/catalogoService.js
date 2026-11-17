
const {
  obtenerCategorias,
  obtenerLibros
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
      (ejemplar) => ejemplar.estado === "disponible"
    ).length;

    return {
      id_libro: libro.id_libro,
      isbn: libro.isbn,
      titulo: libro.titulo,
      autor: libro.autor,
      id_categoria: libro.id_categoria,
      categoria: libro.categorias?.nombre || "Sin categoría",
      disponibles: disponibles,
      total: ejemplares.length
    };
  });
}

module.exports = {
  listarCategorias,
  listarLibros
};
