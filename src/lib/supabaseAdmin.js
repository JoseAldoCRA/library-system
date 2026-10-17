import "server-only";
import { createClient } from "@supabase/supabase-js";

export function crearClienteSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !clave) {
    throw new Error(
      "Falta configurar Supabase para las operaciones administrativas."
    );
  }

  const supabase = createClient(url, clave, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabase;
}
