
const crearClienteAutenticado = require("../supabaseAutenticado");

async function verificarBibliotecario(req, res, next) {
  try {
    const supabase = crearClienteAutenticado(req.token);

    const { data: perfil, error } = await supabase
      .from("usuarios")
      .select("id_usuario, rol, estado")
      .eq("auth_user_id", req.usuarioAuth.id)
      .eq("rol", "bibliotecario")
      .eq("estado", "activo")
      .maybeSingle();

    if (error) {
      console.error("Error al consultar el perfil:", error.message);

      return res.status(500).json({
        error: "No se pudo verificar el perfil del usuario.",
      });
    }

    if (!perfil) {
      return res.status(403).json({
        error: "No tienes permisos de bibliotecario.",
      });
    }

    req.perfilBibliotecario = perfil;

    next();
  } catch (error) {
    console.error("Error al verificar bibliotecario:", error.message);

    return res.status(500).json({
      error: "No se pudieron verificar los permisos.",
    });
  }
}

module.exports = verificarBibliotecario;
