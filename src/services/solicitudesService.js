import { crearClienteSupabase } from "@/lib/supabaseClient";

// Crear una solicitud de préstamo mediante el microservicio
export async function crearSolicitudPrestamo(idLibro) {
  const id = Number(idLibro);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Debes seleccionar un libro válido.");
  }

  const supabase = crearClienteSupabase();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Debes iniciar sesión para solicitar un préstamo.");
  }

  const respuesta = await fetch(
    "http://localhost:4003/api/prestamos/solicitudes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        id_libro: id,
      }),
    },
  );

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.error || "No se pudo registrar la solicitud de préstamo.",
    );
  }

  return datos;
}

// Consultar las solicitudes del estudiante o docente autenticado
export async function obtenerMisSolicitudes() {
  const supabase = crearClienteSupabase();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Debes iniciar sesión para consultar tus solicitudes.");
  }

  const respuesta = await fetch(
    "http://localhost:4003/api/prestamos/solicitudes/mias",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    },
  );

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.error || "No se pudieron consultar tus solicitudes.",
    );
  }

  return datos;
}