import { crearClienteSupabase } from "@/lib/supabaseClient";

export async function listarUsuarios() {
  const supabase = crearClienteSupabase();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Debes iniciar sesión como bibliotecario.");
  }

  const respuesta = await fetch("http://localhost:4004/api/usuarios", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos.error || "No se pudieron consultar los usuarios."
    );
  }

  return datos;
}

 // Consultar estudiantes y docentes activos para préstamos
export async function listarUsuariosPrestamo() {
  const supabase = crearClienteSupabase();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    throw new Error("Debes iniciar sesión como bibliotecario.");
  }

  const respuesta = await fetch(
    "http://localhost:4004/api/usuarios/para-prestamos",
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
      datos.error || "No se pudieron consultar los usuarios para préstamos."
    );
  }

  return datos;
}