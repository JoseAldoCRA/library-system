import { obtenerLibros, obtenerCategorias, insertarLibro } from "@/repositories/librosRepository";

export async function listarLibros() {
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
      categoria: libro.categorias?.nombre || "Sin categoría",
      disponibles: disponibles,
      total: ejemplares.length,
    };
  });
}

export async function listarCategorias() {
  return await obtenerCategorias();
}


export async function registrarNuevoLibro(libro) {
  const isbn = libro.isbn.trim();
  const titulo = libro.titulo.trim();
  const autor = libro.autor.trim();
  const id_categoria = Number(libro.id_categoria);

  if (!isbn || !titulo || !autor || !Number.isInteger(id_categoria) || id_categoria <= 0) {
    throw new Error("Completa correctamente todos los campos.");
  }

  if (isbn.length > 30) {
    throw new Error("El ISBN no puede superar 30 caracteres.");
  }

  try {
    return await insertarLibro({
      isbn,
      titulo,
      autor,
      id_categoria
    });
  } catch (error) {
    if (error.message.includes("libros_isbn_key")) {
      throw new Error("Ya existe un libro registrado con ese ISBN.");
    }

    throw error;
  }
}
