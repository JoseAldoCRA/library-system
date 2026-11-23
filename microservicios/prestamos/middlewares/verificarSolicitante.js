const crearClienteAutenticado = require("../supabaseAutenticado");

async function verificarSolicitante(req, res, next) {
  try {
    if (!req.usuarioAuth || !req.token) {
      return res.status(401).json({
        error: "Debes iniciar sesión.",
      });
    }

    const supabase = crearClienteAutenticado(req.token);

    const { data: perfil, error } = await supabase
      .from("usuarios")
      .select("id_usuario, rol, estado")
      .eq("auth_user_id", req.usuarioAuth.id)
      .maybeSingle();

    if (error) {
      console.error("Error al consultar el perfil:", error.message);

      return res.status(500).json({
        error: "No se pudieron comprobar los permisos.",
      });
    }

    if (
      !perfil ||
      perfil.estado !== "activo" ||
      !["estudiante", "docente"].includes(perfil.rol)
    ) {
      return res.status(403).json({
        error: "No tienes permisos para solicitar préstamos.",
      });
    }

    req.perfilSolicitante = perfil;

    next();
  } catch (error) {
    console.error("Error al verificar solicitante:", error.message);

    return res.status(500).json({
      error: "Error al verificar los permisos.",
    });
  }
}

module.exports = verificarSolicitante;