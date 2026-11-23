import { crearClienteSupabase } from "@/lib/supabaseClient";

export async function listarPrestamosActivos() {
  const supabase = crearClienteSupabase();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Debes iniciar sesión primero.");
  }

  const respuesta = await fetch(
    "http://localhost:4003/api/prestamos/activos",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    }
  );

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.error || "No se pudieron consultar los préstamos activos."
    );
  }

  return datos;
}



export async function registrarDevolucion(idPrestamo) {
  const id = Number(idPrestamo);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new Error("Debes seleccionar un préstamo válido.");
  }

  const supabase = crearClienteSupabase();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Debes iniciar sesión primero.");
  }

  const respuesta = await fetch(
    `http://localhost:4003/api/prestamos/${id}/devolucion`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.error || "No se pudo registrar la devolución.");
  }

  return datos;
}


export async function listarMisPrestamos() {
  const supabase = crearClienteSupabase();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Debes iniciar sesión primero.");
  }

  const respuesta = await fetch(
    "http://localhost:4003/api/prestamos/mios",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    }
  );

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.error || "No se pudieron consultar tus préstamos."
    );
  }

  return datos;
}


export async function listarHistorialDevoluciones() {
  const supabase = crearClienteSupabase();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Debes iniciar sesión primero.");
  }

  const respuesta = await fetch(
    "http://localhost:4003/api/prestamos/historial",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      cache: "no-store",
    }
  );

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.error || "No se pudo consultar el historial de devoluciones."
    );
  }

  return datos;
}
