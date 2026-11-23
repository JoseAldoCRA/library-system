export async function listarLibros() {
  const respuesta = await fetch(
    "http://localhost:4002/api/catalogo/libros",
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!respuesta.ok) {
    throw new Error("No se pudieron obtener los libros.");
  }

  return await respuesta.json();
}

export async function listarCategorias() {
  const respuesta = await fetch(
    "http://localhost:4002/api/catalogo/categorias",
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!respuesta.ok) {
    throw new Error("No se pudieron obtener las categorías.");
  }

  return await respuesta.json();
}

export async function listarLibrosPublicos() {
  const respuesta = await fetch(
    "http://localhost:4002/api/catalogo/libros/publico",
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!respuesta.ok) {
    throw new Error("No se pudo consultar el catálogo público.");
  }

  return await respuesta.json();
}

// Consultar un libro por su identificador
export async function consultarLibroPorId(idLibro) {
  const id = Number(idLibro);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("El libro seleccionado no es válido.");
  }

  const respuesta = await fetch(
    `http://localhost:4002/api/catalogo/libros/${id}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const datos = await respuesta.json();

  if (respuesta.status === 404) {
    return null;
  }

  if (!respuesta.ok) {
    throw new Error(datos.error || "No se pudo consultar el libro.");
  }

  return datos;
}