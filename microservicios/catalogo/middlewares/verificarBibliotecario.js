
const { createClient } = require("@supabase/supabase-js");

async function verificarBibliotecario(req, res, next) {
  try {
    if (!req.usuarioAuth || !req.token) {
      return res.status(401).json({
        error: "Debes iniciar sesión."
      });
    }

    // Crear un cliente con el token del usuario autenticado
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_PUBLISHABLE_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${req.token}`
          }
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );

    // Consultar la función de autorización de PostgreSQL
    const { data, error } = await supabase.rpc("es_bibliotecario");

    if (error) {
      console.error("Error al verificar bibliotecario:", error.message);

      return res.status(500).json({
        error: "No se pudieron comprobar los permisos."
      });
    }

    if (data !== true) {
      return res.status(403).json({
        error: "No tienes permisos de bibliotecario."
      });
    }

    next();
  } catch (error) {
    console.error("Error de autorización:", error.message);

    return res.status(500).json({
      error: "Error al verificar los permisos."
    });
  }
}

module.exports = verificarBibliotecario;
