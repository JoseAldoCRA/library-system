
const crearClienteAutenticado = require("../supabaseAutenticado");

async function verificarBibliotecario(req, res, next) {
  try {
    if (!req.usuarioAuth || !req.token) {
      return res.status(401).json({
        error: "Debes iniciar sesión."
      });
    }

    const supabase = crearClienteAutenticado(req.token);

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
