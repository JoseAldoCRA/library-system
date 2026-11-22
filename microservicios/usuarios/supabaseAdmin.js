
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

function crearClienteSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !clave) {
    throw new Error(
      "Falta configurar Supabase para las operaciones administrativas."
    );
  }

  return createClient(url, clave, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

module.exports = crearClienteSupabaseAdmin;
