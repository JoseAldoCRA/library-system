
const supabase = require("../supabaseClient");

async function verificarToken(req, res, next) {
  const autorizacion = req.headers.authorization;

  if (!autorizacion || !autorizacion.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Debes iniciar sesión.",
    });
  }

  const token = autorizacion.substring(7).trim();

  if (!token) {
    return res.status(401).json({
      error: "Debes iniciar sesión.",
    });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        error: "Tu sesión no es válida.",
      });
    }

    req.token = token;
    req.usuarioAuth = data.user;

    next();
  } catch (error) {
    console.error("Error al verificar el token:", error.message);

    return res.status(500).json({
      error: "No se pudo verificar la sesión.",
    });
  }
}

module.exports = verificarToken;
