import { crearClienteSupabase } from "@/lib/supabaseClient";

export async function insertarPrestamo(prestamo) {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase.rpc("registrar_prestamo", {
    p_id_usuario: prestamo.id_usuario,
    p_id_ejemplar: prestamo.id_ejemplar,
    p_fecha_vencimiento: prestamo.fecha_vencimiento,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function obtenerPrestamosActivos() {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("prestamos")
    .select(`
      id_prestamo,
      fecha_prestamo,
      fecha_vencimiento,
      fecha_devolucion,
      usuarios (
        nombre
      ),
      ejemplares (
        codigo,
        libros (
          titulo
        )
      )
    `)
    .is("fecha_devolucion", null)
    .order("fecha_vencimiento", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}