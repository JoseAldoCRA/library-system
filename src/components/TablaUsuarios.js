
"use client";

import { useEffect, useState } from "react";
import { listarUsuarios } from "@/services/usuariosService";
import { crearClienteSupabase } from "@/lib/supabaseClient";

import {
  Users,
  Search,
  Pencil,
  X,
  Save,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import styles from "./TablaLibros.module.css";

export default function TablaUsuarios({ actualizacion }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const [nombreEditado, setNombreEditado] = useState("");
  const [correoEditado, setCorreoEditado] = useState("");
  const [rolEditado, setRolEditado] = useState("");
  const [estadoEditado, setEstadoEditado] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    let activo = true;

    async function cargarUsuarios() {
      setCargando(true);
      setError("");

      try {
        const datos = await listarUsuarios();

        if (activo) {
          setUsuarios(datos || []);
        }
      } catch (error) {
        if (activo) {
          setError(error.message);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarUsuarios();

    return () => {
      activo = false;
    };
  }, [actualizacion]);

  // Abrir edición

  function editarUsuario(usuario) {
    setUsuarioEditando(usuario.id_usuario);

    setNombreEditado(usuario.nombre);
    setCorreoEditado(usuario.correo);
    setRolEditado(usuario.rol);
    setEstadoEditado(usuario.estado);

    setMensaje("");
  }

  // Cerrar edición

  function cancelarEdicion() {
    if (guardando) return;

    setUsuarioEditando(null);
    setNombreEditado("");
    setCorreoEditado("");
    setRolEditado("");
    setEstadoEditado("");
    setMensaje("");
  }

  // Guardar cambios

  async function guardarEdicion(idUsuario) {
    if (guardando) return;

    const nombre = nombreEditado.trim();

    if (!nombre || nombre.length > 100) {
      setMensaje(
        "Error: Ingresa un nombre válido de máximo 100 caracteres."
      );
      return;
    }

    setGuardando(true);
    setMensaje("");

    try {
      const supabase = crearClienteSupabase();

      const {
        data: { session },
        error: errorSesion,
      } = await supabase.auth.getSession();

      if (errorSesion || !session) {
        throw new Error("Debes iniciar sesión como bibliotecario.");
      }

      const respuesta = await fetch("/api/bibliotecario/usuarios", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id_usuario: idUsuario,
          nombre: nombre,
          correo: correoEditado.trim().toLowerCase(),
          rol: rolEditado,
          estado: estadoEditado,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.error || "No se pudo actualizar el usuario."
        );
      }

      setUsuarios((anteriores) =>
        anteriores.map((usuario) =>
          usuario.id_usuario === idUsuario
            ? { ...usuario, ...datos.usuario }
            : usuario
        )
      );

      setUsuarioEditando(null);
      setNombreEditado("");
      setMensaje("Usuario actualizado correctamente.");

    } catch (error) {
      setMensaje("Error: " + error.message);
    } finally {
      setGuardando(false);
    }
  }

  // Filtrar usuarios

  const usuariosVisibles = usuarios.filter(
    (usuario) => usuario.rol !== "bibliotecario"
  );

  const usuariosFiltrados = usuariosVisibles.filter((usuario) => {
    const texto = busqueda.toLowerCase().trim();

    return (
      String(usuario.nombre || "").toLowerCase().includes(texto) ||
      String(usuario.correo || "").toLowerCase().includes(texto) ||
      String(usuario.rol || "").toLowerCase().includes(texto)
    );
  });

  // Paginación

  const totalPaginas = Math.max(
    1,
    Math.ceil(usuariosFiltrados.length / 10)
  );

  const paginaVisible = Math.min(pagina, totalPaginas);

  const usuariosPagina = usuariosFiltrados.slice(
    (paginaVisible - 1) * 10,
    paginaVisible * 10
  );

  return (
    <section className={styles.tarjeta}>

      {/* ENCABEZADO */}

      <div className={styles.encabezado}>
        <div className={styles.titulo}>
          <div className={styles.icono}>
            <Users size={25} />
          </div>

          <div>
            <h2>Usuarios registrados</h2>
            <p>
              Consulta y administra las cuentas de la biblioteca.
            </p>
          </div>
        </div>

        <span className={styles.total}>
          {usuariosVisibles.length} usuarios
        </span>
      </div>

      {/* BUSCADOR */}

      <div className={styles.buscador}>
        <Search size={20} />

        <input
          type="search"
          aria-label="Buscar usuarios"
          placeholder="Buscar por nombre, correo o rol..."
          value={busqueda}
          onChange={(evento) => {
            setBusqueda(evento.target.value);
            setPagina(1);
          }}
        />
      </div>

      {mensaje && usuarioEditando === null && (
        <p
          role="status"
          className={
            mensaje.startsWith("Error")
              ? styles.mensajeError
              : styles.mensajeExito
          }
        >
          {mensaje}
        </p>
      )}

      {cargando && (
        <p className={styles.mensaje}>
          Cargando usuarios...
        </p>
      )}

      {error && (
        <p className={styles.mensajeError}>
          Error: {error}
        </p>
      )}

      {!cargando && !error && (
        <>
          <p className={styles.contador}>
            {usuariosFiltrados.length} resultados encontrados
          </p>

          {usuariosFiltrados.length === 0 ? (
            <p className={styles.mensaje}>
              {usuariosVisibles.length === 0
                ? "No hay usuarios registrados."
                : "No se encontraron usuarios."}
            </p>
          ) : (
            <>
              <div className={styles.tablaContenedor}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuariosPagina.map((usuario) => (
                      <tr key={usuario.id_usuario}>
                        <td className={styles.nombreLibro}>
                          {usuario.nombre}
                        </td>

                        <td>{usuario.correo}</td>

                        <td>
                          <span className={styles.etiquetaRol}>
                            {usuario.rol === "estudiante"
                              ? "Estudiante"
                              : "Docente"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              usuario.estado === "activo"
                                ? styles.estadoDevuelto
                                : styles.estadoInactivo
                            }
                          >
                            {usuario.estado === "activo"
                              ? "Activo"
                              : "Inactivo"}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className={styles.botonEditarUsuario}
                            onClick={() => editarUsuario(usuario)}
                            disabled={guardando}
                          >
                            <Pencil size={16} />
                            Editar usuario
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPaginas > 1 && (
                <div className={styles.paginacion}>
                  <button
                    type="button"
                    disabled={paginaVisible === 1}
                    onClick={() =>
                      setPagina(paginaVisible - 1)
                    }
                  >
                    <ChevronLeft size={17} />
                    Anterior
                  </button>

                  <span>
                    Página {paginaVisible} de {totalPaginas}
                  </span>

                  <button
                    type="button"
                    disabled={paginaVisible === totalPaginas}
                    onClick={() =>
                      setPagina(paginaVisible + 1)
                    }
                  >
                    Siguiente
                    <ChevronRight size={17} />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* VENTANA DE EDICIÓN */}

      {usuarioEditando !== null && (
        <div className={styles.fondoModal}>
          <div
            className={styles.modalUsuario}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloEditarUsuario"
          >
            <div className={styles.encabezadoEditarUsuario}>
              <div className={styles.icono}>
                <Pencil size={23} />
              </div>

              <div className={styles.tituloEditarUsuario}>
                <h3 id="tituloEditarUsuario">
                  Editar usuario
                </h3>
                <p>Modifica los datos de la cuenta.</p>
              </div>

              <button
                type="button"
                className={styles.cerrarEditarUsuario}
                onClick={cancelarEdicion}
                disabled={guardando}
                aria-label="Cerrar ventana"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(evento) => {
                evento.preventDefault();
                guardarEdicion(usuarioEditando);
              }}
            >
              <div className={styles.camposEditarUsuario}>

                <div className={styles.grupoEditarUsuario}>
                  <label htmlFor="editar-nombre">
                    Nombre completo
                  </label>

                  <input
                    id="editar-nombre"
                    type="text"
                    value={nombreEditado}
                    onChange={(evento) =>
                      setNombreEditado(evento.target.value)
                    }
                    maxLength={100}
                    required
                    disabled={guardando}
                  />
                </div>

                <div className={styles.grupoEditarUsuario}>
                  <label htmlFor="editar-correo">
                    Correo electrónico
                  </label>

                  <input
                    id="editar-correo"
                    type="email"
                    value={correoEditado}
                    onChange={(evento) =>
                      setCorreoEditado(evento.target.value)
                    }
                    required
                    disabled={guardando}
                  />
                </div>

                <div className={styles.grupoEditarUsuario}>
                  <label htmlFor="editar-rol">
                    Rol
                  </label>

                  <select
                    id="editar-rol"
                    value={rolEditado}
                    onChange={(evento) =>
                      setRolEditado(evento.target.value)
                    }
                    disabled={guardando}
                  >
                    <option value="estudiante">Estudiante</option>
                    <option value="docente">Docente</option>
                  </select>
                </div>

                <div className={styles.grupoEditarUsuario}>
                  <label htmlFor="editar-estado">
                    Estado
                  </label>

                  <select
                    id="editar-estado"
                    value={estadoEditado}
                    onChange={(evento) =>
                      setEstadoEditado(evento.target.value)
                    }
                    disabled={guardando}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>

              </div>

              {mensaje && (
                <p
                  role="status"
                  className={
                    mensaje.startsWith("Error")
                      ? styles.mensajeError
                      : styles.mensajeExito
                  }
                >
                  {mensaje}
                </p>
              )}

              <div className={styles.accionesEditarUsuario}>
                <button
                  type="button"
                  className={styles.cancelarEditarUsuario}
                  onClick={cancelarEdicion}
                  disabled={guardando}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className={styles.guardarEditarUsuario}
                  disabled={guardando}
                >
                  <Save size={17} />

                  {guardando
                    ? "Guardando..."
                    : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}
