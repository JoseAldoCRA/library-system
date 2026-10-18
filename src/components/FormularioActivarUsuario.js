"use client";

import { useEffect, useState } from "react";
import { crearClienteSupabase } from "@/lib/supabaseClient";
import { listarUsuarios } from "@/services/usuariosService";

export default function FormularioActivarUsuario() {
  const [usuarios, setUsuarios] = useState([]);
  const [idUsuario, setIdUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [esError, setEsError] = useState(false);

  useEffect(() => {
    async function cargarUsuarios() {
      try {
        const datos = await listarUsuarios();

        const pendientes = datos.filter((usuario) => {
          return (
            !usuario.tieneCuenta &&
            usuario.estado === "activo" &&
            ["estudiante", "docente"].includes(usuario.rol)
          );
        });

        setUsuarios(pendientes);
      } catch (error) {
        setEsError(true);
        setMensaje("Error: " + error.message);
      } finally {
        setCargando(false);
      }
    }

    cargarUsuarios();
  }, []);

  async function activarUsuario(evento) {
    evento.preventDefault();

    if (guardando) return;

    setMensaje("");
    setEsError(false);

    if (!idUsuario) {
      setEsError(true);
      setMensaje("Selecciona un usuario.");
      return;
    }

    if (contrasena.length < 8 || contrasena.length > 72) {
      setEsError(true);
      setMensaje("La contraseña debe tener entre 8 y 72 caracteres.");
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setEsError(true);
      setMensaje("Las contraseñas no coinciden.");
      return;
    }

    setGuardando(true);

    try {
      const supabase = crearClienteSupabase();

      const {
        data: { session },
        error: errorSesion,
      } = await supabase.auth.getSession();

      if (errorSesion || !session) {
        throw new Error("Debes iniciar sesión como bibliotecario.");
      }

      const respuesta = await fetch("/api/bibliotecario/usuarios/activar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id_usuario: Number(idUsuario),
          contrasena: contrasena,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.error || "No se pudo activar la cuenta.");
      }

      setMensaje("Cuenta activada correctamente.");

      setUsuarios((anteriores) =>
        anteriores.filter(
          (usuario) => usuario.id_usuario !== Number(idUsuario),
        ),
      );

      setIdUsuario("");
      setContrasena("");
      setConfirmarContrasena("");
    } catch (error) {
      setEsError(true);
      setMensaje("Error: " + error.message);
    } finally {
      setGuardando(false);
    }
  }

  const estiloEtiqueta = {
    color: "#334155",
    display: "block",
    marginBottom: "8px",
    fontWeight: "500",
  };

  const estiloCampo = {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    marginBottom: "18px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    backgroundColor: "white",
    color: "#334155",
  };

  return (
    <section style={{ marginTop: "35px" }}>
      <h2 style={{ color: "#194b78" }}>Activar cuenta existente</h2>

      <p style={{ color: "#334155", marginTop: "10px" }}>
        Asigna una contraseña a un usuario que todavía no tiene acceso al
        sistema.
      </p>

      {cargando ? (
        <p style={{ marginTop: "15px" }}>Cargando usuarios...</p>
      ) : usuarios.length === 0 ? (
        <p style={{ marginTop: "15px" }}>
          No hay usuarios pendientes de activación.
        </p>
      ) : (
        <form onSubmit={activarUsuario} style={{ marginTop: "20px" }}>
          <label htmlFor="usuarioActivar" style={estiloEtiqueta}>
            Usuario pendiente de activación
          </label>

          <select
            id="usuarioActivar"
            value={idUsuario}
            onChange={(evento) => setIdUsuario(evento.target.value)}
            required
            style={estiloCampo}
          >
            <option value="">Selecciona un usuario</option>

            {usuarios.map((usuario) => (
              <option key={usuario.id_usuario} value={usuario.id_usuario}>
                {usuario.nombre} - {usuario.correo}
              </option>
            ))}
          </select>

          <label htmlFor="contrasenaActivar"  style={estiloEtiqueta}>Contraseña inicial</label>

          <input
            id="contrasenaActivar"
            type="password"
            value={contrasena}
            onChange={(evento) => setContrasena(evento.target.value)}
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            required
            style={estiloCampo}
          />

          <label htmlFor="confirmarContrasenaActivar"  style={estiloEtiqueta}>
            Confirmar contraseña
          </label>

          <input
            id="confirmarContrasenaActivar"
            type="password"
            value={confirmarContrasena}
            onChange={(evento) => setConfirmarContrasena(evento.target.value)}
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            required
            style={estiloCampo}
          />

          <button
            type="submit"
            disabled={guardando}
            style={{
              width: "100%",
              padding: "12px",
              background: "#194b78",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: guardando ? "not-allowed" : "pointer",
            }}
          >
            {guardando ? "Activando..." : "Activar cuenta"}
          </button>
        </form>
      )}

      {mensaje && (
        <p
          role="status"
          style={{
            marginTop: "15px",
            color: esError ? "#b91c1c" : "#166534",
          }}
        >
          {mensaje}
        </p>
      )}
    </section>
  );
}
