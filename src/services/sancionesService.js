import { crearClienteSupabase } from "@/lib/supabaseClient";

// Obtener el token de la sesión actual
async function obtenerToken() {
  const supabase = crearClienteSupabase();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Debes iniciar sesión primero.");
  }

  return session.access_token;
}

// Consultar todas las sanciones (Bibliotecario)
export async function listarSanciones() {
  const token = await obtenerToken();

  const respuesta = await fetch(
    "http://localhost:4003/api/prestamos/sanciones",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.error || "No se pudieron consultar las sanciones.");
  }

  return datos;
}


export async function registrarNuevoPago(idSancion) {
  const id = Number(idSancion);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Debes seleccionar una sanción válida.");
  }

  const token = await obtenerToken();

  const respuesta = await fetch(
    `http://localhost:4003/api/prestamos/sanciones/${id}/pagar`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.error || "No se pudo registrar el pago de la sanción."
    );
  }

  return datos;
}


// Consultar las sanciones del Estudiante o Docente
export async function listarMisSanciones() {
  const token = await obtenerToken();

  const respuesta = await fetch(
    "http://localhost:4003/api/prestamos/sanciones/mias",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    }
  );

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.error || "No se pudieron consultar tus sanciones.");
  }

  return datos;
}
