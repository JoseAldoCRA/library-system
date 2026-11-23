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

// Cancelar una solicitud de préstamo del usuario autenticado
export async function cancelarSolicitudPrestamo(idSolicitud) {
  const id = Number(idSolicitud);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("La solicitud seleccionada no es válida.");
  }

  const supabase = crearClienteSupabase();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Debes iniciar sesión para cancelar una solicitud.");
  }

  const respuesta = await fetch(
    `http://localhost:4003/api/prestamos/solicitudes/${id}/cancelar`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  );

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.error || "No se pudo cancelar la solicitud.",
    );
  }

  return datos;
}

// Consultar todas las solicitudes de préstamo (Bibliotecario)
export async function obtenerTodasSolicitudes() {
  const supabase = crearClienteSupabase();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Debes iniciar sesión para consultar las solicitudes.");
  }

  const respuesta = await fetch(
    "http://localhost:4003/api/prestamos/solicitudes",
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
      datos.error || "No se pudieron consultar las solicitudes.",
    );
  }

  return datos;
}

// Rechazar una solicitud de préstamo (Bibliotecario)
export async function rechazarSolicitudPrestamo(idSolicitud) {
  const id = Number(idSolicitud);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("La solicitud seleccionada no es válida.");
  }

  const supabase = crearClienteSupabase();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Debes iniciar sesión como bibliotecario.");
  }

  const respuesta = await fetch(
    `http://localhost:4003/api/prestamos/solicitudes/${id}/rechazar`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.error || "No se pudo rechazar la solicitud."
    );
  }

  return datos;
}

// Aprobar una solicitud de préstamo desde el microservicio
export async function aprobarSolicitudPrestamo(
  idSolicitud,
  idEjemplar,
  fechaVencimiento
) {
  const id = Number(idSolicitud);
  const ejemplar = Number(idEjemplar);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("La solicitud seleccionada no es válida.");
  }

  if (!Number.isSafeInteger(ejemplar) || ejemplar <= 0) {
    throw new Error("Debes seleccionar un ejemplar válido.");
  }

  const supabase = crearClienteSupabase();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Debes iniciar sesión como bibliotecario.");
  }

  const respuesta = await fetch(
    `http://localhost:4003/api/prestamos/solicitudes/${id}/aprobar`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_ejemplar: ejemplar,
        fecha_vencimiento: fechaVencimiento,
      }),
    }
  );

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.error || "No se pudo aprobar la solicitud."
    );
  }

  return datos;
}