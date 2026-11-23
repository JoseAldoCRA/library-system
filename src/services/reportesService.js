
import { crearClienteSupabase } from "@/lib/supabaseClient";

// Obtener el token del usuario autenticado
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

// Consultar los reportes del microservicio de Préstamos
async function obtenerReportePrestamos(token) {
  const respuesta = await fetch(
    "http://localhost:4003/api/prestamos/reportes",
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
    throw new Error(
      datos.error || "No se pudieron consultar los reportes de préstamos."
    );
  }

  return datos;
}

// Consultar los reportes del microservicio de Catálogo
async function obtenerReporteInventario(token) {
  const respuesta = await fetch(
    "http://localhost:4002/api/catalogo/reportes",
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
    throw new Error(
      datos.error || "No se pudieron consultar los reportes de inventario."
    );
  }

  return datos;
}

// Generar el reporte completo de la biblioteca
export async function generarReporteBiblioteca() {
  const token = await obtenerToken();

  const [reportePrestamos, reporteInventario] = await Promise.all([
    obtenerReportePrestamos(token),
    obtenerReporteInventario(token),
  ]);

  return {
    ...reportePrestamos,
    ...reporteInventario,
  };
}
