import { crearClienteSupabase } from "@/lib/supabaseClient";

export async function obtenerSanciones() {
  const supabase = crearClienteSupabase();

  const { data, error } = await supabase
    .from("sanciones")
    .select(`
      id_sancion,
      id_prestamo,
      dias_retraso,
      monto,
      estado_pago,
      prestamos (
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
      )
    `)
    .order("id_sancion", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function registrarPagoSancion(idSancion) {
  const supabase = crearClienteSupabase();

  const { error } = await supabase.rpc("registrar_pago_sancion", {
    p_id_sancion: idSancion,
  });

  if (error) {
    throw new Error(error.message);
  }
}