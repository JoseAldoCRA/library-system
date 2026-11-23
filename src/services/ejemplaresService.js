export async function listarEjemplares() {
  const respuesta = await fetch(
    "http://localhost:4002/api/catalogo/ejemplares",
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!respuesta.ok) {
    throw new Error("No se pudieron obtener los ejemplares.");
  }

  return await respuesta.json();
}

export async function listarEjemplaresDisponibles() {
  const respuesta = await fetch(
    "http://localhost:4002/api/catalogo/ejemplares/disponibles",
    {
      method: "GET",
      cache: "no-store",
    }
  );

  if (!respuesta.ok) {
    throw new Error("No se pudieron obtener los ejemplares disponibles.");
  }

  return await respuesta.json();
}