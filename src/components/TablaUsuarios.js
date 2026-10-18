"use client";

import { useEffect, useState } from "react";
import { listarUsuarios } from "@/services/usuariosService";
import { crearClienteSupabase } from "@/lib/supabaseClient";

export default function TablaUsuarios({ actualizacion }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Estados para editar usuarios
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  const [nombreEditado, setNombreEditado] = useState("");
  const [correoEditado, setCorreoEditado] = useState("");
  const [rolEditado, setRolEditado] = useState("");
  const [estadoEditado, setEstadoEditado] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarUsuarios() {
      setCargando(true);
      setError("");

      try {
        const datos = await listarUsuarios();

        if (activo) {
          setUsuarios(datos);
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

  // Activar el formulario de edición
  function editarUsuario(usuario) {
    setUsuarioEditando(usuario.id_usuario);

    setNombreEditado(usuario.nombre);
    setCorreoEditado(usuario.correo);
    setRolEditado(usuario.rol);
    setEstadoEditado(usuario.estado);

    setMensaje("");
  }

  // Cancelar la edición
  function cancelarEdicion() {
    setUsuarioEditando(null);

    setNombreEditado("");
    setCorreoEditado("");
    setRolEditado("");
    setEstadoEditado("");

    setMensaje("");
  }

  // Guardar el nuevo nombre
  async function guardarEdicion(idUsuario) {
    const nombre = nombreEditado.trim();

    if (!nombre || nombre.length > 100) {
      setMensaje("Error: Ingresa un nombre válido de máximo 100 caracteres.");
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
        throw new Error(datos.error || "No se pudo actualizar el usuario.");
      }

      // Actualizar la tabla sin recargar la página
      setUsuarios((anteriores) =>
        anteriores.map((usuario) =>
          usuario.id_usuario === idUsuario
            ? { ...usuario, ...datos.usuario }
            : usuario,
        ),
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

  const estiloCelda = {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#ffffff",
    color: "#334155",
  };

  const estiloCampo = {
    width: "100%",
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#1e293b",
    fontSize: "15px",
    boxSizing: "border-box",
  };

  const estiloEtiqueta = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "600",
    color: "#194b78",
  };

  const estiloBoton = {
    padding: "8px 12px",
    backgroundColor: "#194b78",
    color: "#ffffff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  };

  return (
    <section style={{ marginTop: "35px" }}>
      <h2 style={{ color: "#194b78", marginBottom: "20px" }}>
        {" "}
        Gestión de usuarios
      </h2>

      {mensaje && (
        <p
          style={{
            color: mensaje.startsWith("Error") ? "#b91c1c" : "#166534",
            marginBottom: "15px",
          }}
        >
          {mensaje}
        </p>
      )}

      {cargando && <p>Cargando usuarios...</p>}

      {error && <p style={{ color: "#b91c1c" }}>Error: {error}</p>}

      {!cargando && !error && usuarios.length === 0 && (
        <p>No hay usuarios registrados.</p>
      )}

      {!cargando && !error && usuarios.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#194b78", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Nombre</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Correo</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Rol</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Estado</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios
                .filter((usuario) => usuario.rol !== "bibliotecario")
                .map((usuario) => (
                  <tr key={usuario.id_usuario}>
                    <td style={estiloCelda}>{usuario.nombre}</td>

                    <td style={estiloCelda}>{usuario.correo}</td>

                    <td style={estiloCelda}>
                      {usuario.rol === "estudiante" ? "Estudiante" : "Docente"}
                    </td>

                    <td style={estiloCelda}>
                      {usuario.estado === "activo" ? "Activo" : "Inactivo"}
                    </td>

                    <td style={estiloCelda}>
                      <button
                        type="button"
                        onClick={() => editarUsuario(usuario)}
                        disabled={guardando}
                        style={estiloBoton}
                      >
                        Editar Usuario
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {usuarioEditando !== null && (
        <div
          style={{
            backgroundColor: "#f8fafc",
            border: "1px solid #dbe3ed",
            borderRadius: "12px",
            padding: "25px",
            marginTop: "25px",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.06)",
          }}
        >
          <h3
            style={{
              color: "#194b78",
              fontSize: "22px",
              marginTop: 0,
              marginBottom: "20px",
            }}
          >
            Editar usuario
          </h3>

          {/* Nombre */}
          <div style={{ marginBottom: "18px" }}>
            <label htmlFor="editar-nombre" style={estiloEtiqueta}>
              Nombre completo
            </label>

            <input
              id="editar-nombre"
              type="text"
              value={nombreEditado}
              onChange={(e) => setNombreEditado(e.target.value)}
              maxLength={100}
              disabled={guardando}
              style={estiloCampo}
            />
          </div>

          {/* Correo */}
          <div style={{ marginBottom: "18px" }}>
            <label htmlFor="editar-correo" style={estiloEtiqueta}>
              Correo electrónico
            </label>

            <input
              id="editar-correo"
              type="email"
              value={correoEditado}
              onChange={(e) => setCorreoEditado(e.target.value)}
              disabled={guardando}
              style={estiloCampo}
            />
          </div>

          {/* Rol y estado */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "18px",
              marginBottom: "25px",
            }}
          >
            <div>
              <label htmlFor="editar-rol" style={estiloEtiqueta}>
                Rol
              </label>

              <select
                id="editar-rol"
                value={rolEditado}
                onChange={(e) => setRolEditado(e.target.value)}
                disabled={guardando}
                style={estiloCampo}
              >
                <option value="estudiante">Estudiante</option>
                <option value="docente">Docente</option>
              </select>
            </div>

            <div>
              <label htmlFor="editar-estado" style={estiloEtiqueta}>
                Estado
              </label>

              <select
                id="editar-estado"
                value={estadoEditado}
                onChange={(e) => setEstadoEditado(e.target.value)}
                disabled={guardando}
                style={estiloCampo}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Botones */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => guardarEdicion(usuarioEditando)}
              disabled={guardando}
              style={{
                ...estiloBoton,
                padding: "12px 20px",
              }}
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>

            <button
              type="button"
              onClick={cancelarEdicion}
              disabled={guardando}
              style={{
                ...estiloBoton,
                backgroundColor: "#64748b",
                padding: "12px 20px",
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
