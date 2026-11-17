
const { createClient } = require("@supabase/supabase-js");

function crearClienteAutenticado(token) {
  if (!token) {
    throw new Error("Se necesita un token de autenticación.");
  }

  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );
}

module.exports = crearClienteAutenticado;
