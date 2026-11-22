
const crearClienteAutenticado = require("../supabaseAutenticado");
const crearClienteSupabaseAdmin = require("../supabaseAdmin");

async function obtenerTodosUsuarios(token) {
  const supabase = crearClienteAutenticado(token);

  const { data, error } = await supabase
    .from("usuarios")
    .select(`
      id_usuario,
      nombre,
      correo,
      rol,
      estado,
      auth_user_id
    `)
    .order("id_usuario", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

async function crearCuentaUsuario(usuario) {
  const supabase = crearClienteSupabaseAdmin();

  const { data, error } = await supabase.auth.admin.createUser({
    email: usuario.correo,
    password: usuario.contrasena,
    email_confirm: true,
    user_metadata: {
      nombre: usuario.nombre,
      rol: usuario.rol,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  if (!data.user) {
    throw new Error("No se pudo crear la cuenta.");
  }

  // Comprobar que el trigger creó el perfil
  const { data: perfil, error: errorPerfil } = await supabase
    .from("usuarios")
    .select("id_usuario, nombre, correo, rol, estado, auth_user_id")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  if (errorPerfil || !perfil) {
    throw new Error(
      "La cuenta se creó, pero no se pudo verificar el perfil. Revisa Supabase antes de volver a intentarlo."
    );
  }

  return {
    mensaje: "Cuenta creada correctamente.",
    id_auth: data.user.id,
    correo: data.user.email,
  };
}

module.exports = {
  obtenerTodosUsuarios,
  crearCuentaUsuario,
};