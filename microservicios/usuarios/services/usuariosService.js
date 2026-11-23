const {
  obtenerTodosUsuarios,
  crearCuentaUsuario,
  obtenerUsuarioPorId,
  comprobarCorreoExistente,
  obtenerCuentaAuth,
  actualizarCuentaAuth,
  actualizarUsuarioEnBD,
} = require("../repositories/usuariosRepository");

async function listarUsuarios(token) {
  const usuarios = await obtenerTodosUsuarios(token);

  return usuarios.map((usuario) => {
    return {
      id_usuario: usuario.id_usuario,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      estado: usuario.estado,
      autenticacion: usuario.auth_user_id
        ? "Vinculado con Auth"
        : "Sin cuenta Auth",
      tieneCuenta: Boolean(usuario.auth_user_id),
    };
  });
}

function validarRegistroUsuario(datos) {
  const nombre =
    typeof datos?.nombre === "string"
      ? datos.nombre.trim()
      : "";

  const correo =
    typeof datos?.correo === "string"
      ? datos.correo.trim().toLowerCase()
      : "";

  const rol = datos?.rol;
  const contrasena = datos?.contrasena;

  if (!nombre || !correo || !rol || !contrasena) {
    throw new Error("Debes completar todos los campos.");
  }

  if (nombre.length > 100) {
    throw new Error("El nombre es demasiado largo.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    throw new Error("El correo electrónico no es válido.");
  }

  if (!["estudiante", "docente"].includes(rol)) {
    throw new Error("Solo puedes registrar estudiantes y docentes.");
  }

  if (
    typeof contrasena !== "string" ||
    contrasena.length < 8 ||
    contrasena.length > 72
  ) {
    throw new Error("La contraseña debe tener entre 8 y 72 caracteres.");
  }

  return {
    nombre,
    correo,
    rol,
    contrasena,
  };
}

async function registrarNuevoUsuario(datos) {
  // Validar la información recibida
  const usuario = validarRegistroUsuario(datos);

  // Crear la cuenta mediante el repositorio
  const resultado = await crearCuentaUsuario(usuario);

  return resultado;
}

function validarEdicionUsuario(datos) {
  const idUsuario = datos?.id_usuario;

  if (!Number.isSafeInteger(idUsuario) || idUsuario <= 0) {
    throw new Error("El usuario seleccionado no es válido.");
  }

  // Los demás campos se validarán después
  // de consultar los datos actuales del usuario.

  return idUsuario;
}

function validarDatosEdicion(datos, usuarioActual) {
  if (!usuarioActual) {
    throw new Error("No se encontró el usuario.");
  }

  if (usuarioActual.rol === "bibliotecario") {
    throw new Error("No puedes editar cuentas de bibliotecarios.");
  }

  const nombre =
    datos.nombre === undefined
      ? usuarioActual.nombre
      : typeof datos.nombre === "string"
        ? datos.nombre.trim()
        : "";

  const correo =
    datos.correo === undefined
      ? usuarioActual.correo
      : typeof datos.correo === "string"
        ? datos.correo.trim().toLowerCase()
        : "";

  const rol =
    datos.rol === undefined
      ? usuarioActual.rol
      : datos.rol;

  const estado =
    datos.estado === undefined
      ? usuarioActual.estado
      : datos.estado;

  if (!nombre || nombre.length > 100) {
    throw new Error(
      "Ingresa un nombre válido de máximo 100 caracteres."
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    throw new Error("El correo electrónico no es válido.");
  }

  if (!["estudiante", "docente"].includes(rol)) {
    throw new Error(
      "Solo puedes seleccionar estudiante o docente."
    );
  }

  if (!["activo", "inactivo"].includes(estado)) {
    throw new Error("El estado debe ser activo o inactivo.");
  }

  return {
    nombre,
    correo,
    rol,
    estado,
  };
}
function prepararCambiosAuth(usuarioActual, cuentaAuth, cambios) {
  const cambiosAuth = {};
  const restaurarAuth = {};

  const cambioCorreo = cambios.correo !== usuarioActual.correo;
  const cambioEstado = cambios.estado !== usuarioActual.estado;
  const cambioDatos =
    cambios.nombre !== usuarioActual.nombre ||
    cambios.rol !== usuarioActual.rol;

  if (cambioCorreo) {
    cambiosAuth.email = cambios.correo;
    cambiosAuth.email_confirm = true;

    restaurarAuth.email = cuentaAuth.email;
    restaurarAuth.email_confirm = true;
  }

  if (cambioEstado) {
    cambiosAuth.ban_duration =
      cambios.estado === "inactivo" ? "876000h" : "none";

    restaurarAuth.ban_duration =
      usuarioActual.estado === "inactivo" ? "876000h" : "none";
  }

  if (cambioDatos) {
    cambiosAuth.user_metadata = {
      ...cuentaAuth.user_metadata,
      nombre: cambios.nombre,
      rol: cambios.rol,
    };

    restaurarAuth.user_metadata = cuentaAuth.user_metadata || {};
  }

  return {
    cambiosAuth,
    restaurarAuth,
  };
}
async function editarUsuario(datos) {
  // Validar el identificador recibido
  const idUsuario = validarEdicionUsuario(datos);

  // Consultar la información actual
  const usuarioActual = await obtenerUsuarioPorId(idUsuario);

  if (!usuarioActual) {
    throw new Error("No se encontró el usuario.");
  }

  // Validar nombre, correo, rol y estado
  const cambios = validarDatosEdicion(datos, usuarioActual);

  // Comprobar que el correo no pertenezca a otro usuario
  const correoDuplicado = await comprobarCorreoExistente(
    cambios.correo,
    idUsuario
  );

  if (correoDuplicado) {
    throw new Error("El correo ya pertenece a otro usuario.");
  }

  // Preparar la sincronización con Supabase Auth
  let cambiosAuth = {};
  let restaurarAuth = {};

  if (usuarioActual.auth_user_id) {
    const cuentaAuth = await obtenerCuentaAuth(
      usuarioActual.auth_user_id
    );

    const preparacion = prepararCambiosAuth(
      usuarioActual,
      cuentaAuth,
      cambios
    );

    cambiosAuth = preparacion.cambiosAuth;
    restaurarAuth = preparacion.restaurarAuth;
  }

  let authModificado = false;

  // Actualizar Supabase Auth si existen cambios
  if (
    usuarioActual.auth_user_id &&
    Object.keys(cambiosAuth).length > 0
  ) {
    try {
      await actualizarCuentaAuth(
        usuarioActual.auth_user_id,
        cambiosAuth
      );

      authModificado = true;
    } catch (error) {
      console.error("Error al actualizar Supabase Auth:", error.message);

      const nuevoError = new Error(
        "No se pudo actualizar la cuenta de acceso. Revisa el correo y los datos."
      );
      nuevoError.status = 400;
      throw nuevoError;
    }
  }

  // Actualizar el perfil en PostgreSQL
  try {
    const actualizado = await actualizarUsuarioEnBD(
      idUsuario,
      cambios
    );

    return {
      mensaje: "Usuario actualizado correctamente.",
      usuario: actualizado,
    };
  } catch (error) {
    // Si modificamos Auth, intentar restaurar sus datos
    if (authModificado) {
      try {
        await actualizarCuentaAuth(
          usuarioActual.auth_user_id,
          restaurarAuth
        );
      } catch (errorRestaurar) {
        console.error(
          "No se pudo restaurar Supabase Auth:",
          errorRestaurar.message
        );

        const errorParcial = new Error(
          "La actualización fue parcial. Revisa la cuenta en Supabase antes de volver a intentarlo."
        );
        errorParcial.status = 500;
        throw errorParcial;
      }
    }

    if (error.code === "23505") {
      const errorDuplicado = new Error(
        "El correo ya está registrado."
      );
      errorDuplicado.status = 409;
      throw errorDuplicado;
    }

    throw error;
  }
}
module.exports = {
  listarUsuarios,
  validarRegistroUsuario,
  registrarNuevoUsuario,
  validarEdicionUsuario,
  validarDatosEdicion,
  prepararCambiosAuth,
  editarUsuario,
};