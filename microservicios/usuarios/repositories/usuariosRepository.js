
const crearClienteAutenticado = require("../supabaseAutenticado");
const crearClienteSupabaseAdmin = require("../supabaseAdmin");

// Obtener el perfil del usuario autenticado
async function obtenerPerfilAutenticado(token, idAuth) {
  const supabase = crearClienteAutenticado(token);

  const { data, error } = await supabase
    .from("usuarios")
    .select("id_usuario, nombre, correo, rol, estado")
    .eq("auth_user_id", idAuth)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

 // Obtener estudiantes y docentes activos para préstamos
async function obtenerUsuariosPrestamo(token) {
  const supabase = crearClienteAutenticado(token);

  const { data, error } = await supabase
    .from("usuarios")
    .select("id_usuario, nombre, rol")
    .eq("estado", "activo")
    .in("rol", ["estudiante", "docente"])
    .order("nombre", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

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

async function obtenerUsuarioPorId(idUsuario) {
  const supabase = crearClienteSupabaseAdmin();

  const { data, error } = await supabase
    .from("usuarios")
    .select("id_usuario, nombre, correo, rol, estado, auth_user_id")
    .eq("id_usuario", idUsuario)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;  
}

async function comprobarCorreoExistente(correo, idUsuario) {
  const supabase = crearClienteSupabaseAdmin();

  const { data, error } = await supabase
    .from("usuarios")
    .select("id_usuario")
    .eq("correo", correo)
    .neq("id_usuario", idUsuario)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

async function obtenerCuentaAuth(idAuth) {
  const supabase = crearClienteSupabaseAdmin();

  const { data, error } = await supabase.auth.admin.getUserById(idAuth);

  if (error || !data?.user) {
    throw new Error("No se encontró la cuenta de autenticación.");
  }

  return data.user;
}

async function actualizarCuentaAuth(idAuth, cambios) {
  const supabase = crearClienteSupabaseAdmin();

  const { data, error } = await supabase.auth.admin.updateUserById(
    idAuth,
    cambios
  );

  if (error || !data?.user) {
    throw new Error(
      error?.message || "No se pudo actualizar la cuenta de autenticación."
    );
  }

  return data.user;
}
async function actualizarUsuarioEnBD(idUsuario, cambios) {
  const supabase = crearClienteSupabaseAdmin();

  const { data, error } = await supabase
    .from("usuarios")
    .update({
      nombre: cambios.nombre,
      correo: cambios.correo,
      rol: cambios.rol,
      estado: cambios.estado,
    })
    .eq("id_usuario", idUsuario)
    .in("rol", ["estudiante", "docente"])
    .select("id_usuario, nombre, correo, rol, estado")
    .single();

  if (error) {
    const nuevoError = new Error(error.message);
    nuevoError.code = error.code;
    throw nuevoError;
  }

  return data;
}
// Guardar una autorizacion temporal para activar una cuenta
async function crearAutorizacionActivacion(idUsuario, codigoHash, venceEn) {
  const supabase = crearClienteSupabaseAdmin();

  const { data, error } = await supabase
    .from("activaciones_usuario")
    .insert({
      id_usuario: idUsuario,
      codigo_hash: codigoHash,
      vence_en: venceEn,
    })
    .select("id_activacion")
    .single();

  if (error || !data) {
    throw new Error("No se pudo autorizar la activacion.");
  }

  return data;
}

// Eliminar una autorizacion temporal
async function eliminarAutorizacionActivacion(idActivacion) {
  const supabase = crearClienteSupabaseAdmin();

  const { error } = await supabase
    .from("activaciones_usuario")
    .delete()
    .eq("id_activacion", idActivacion);

  if (error) {
    throw new Error(error.message);
  }
}

// Crear el acceso de Auth para un perfil existente
async function crearAccesoUsuario(usuario, contrasena, codigo) {
  const supabase = crearClienteSupabaseAdmin();

  const { data, error } = await supabase.auth.admin.createUser({
    email: usuario.correo,
    password: contrasena,
    email_confirm: true,
    user_metadata: {
      nombre: usuario.nombre,
      rol: usuario.rol,
      codigo_activacion: codigo,
    },
  });

  if (error || !data?.user) {
    throw new Error(
      error?.message || "No se pudo crear el acceso del usuario."
    );
  }

  return data.user;
}

// Consultar el perfil para verificar su vinculacion
async function obtenerVinculoUsuario(idUsuario) {
  const supabase = crearClienteSupabaseAdmin();

  const { data, error } = await supabase
    .from("usuarios")
    .select("id_usuario, auth_user_id")
    .eq("id_usuario", idUsuario)
    .single();

  if (error || !data) {
    throw new Error("No se pudo verificar el vinculo del usuario.");
  }

  return data;
}

module.exports = {
  obtenerPerfilAutenticado,
  obtenerUsuariosPrestamo,
  obtenerTodosUsuarios,
  crearCuentaUsuario,
  obtenerUsuarioPorId,
  comprobarCorreoExistente,
  obtenerCuentaAuth,
  actualizarCuentaAuth,
  actualizarUsuarioEnBD,
  crearAutorizacionActivacion,
  eliminarAutorizacionActivacion,
  crearAccesoUsuario,
  obtenerVinculoUsuario,
};