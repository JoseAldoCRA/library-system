
"use client";

import { useState } from "react";
import { crearClienteSupabase } from "@/lib/supabaseClient";

export default function FormularioRegistrarUsuario({ alRegistrar }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function registrarUsuario(evento) {
    evento.preventDefault();

    if (guardando) return;

    setMensaje("");

    if (contrasena.length < 8 || contrasena.length > 72) {
      setMensaje("Error: La contraseña debe tener entre 8 y 72 caracteres.");
      return;
    }

    if (contrasena !== confirmarContrasena) {
      setMensaje("Error: Las contraseñas no coinciden.");
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

      const respuesta = await fetch("/api/bibliotecario/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          nombre: nombre,
          correo: correo,
          rol: rol,
          contrasena: contrasena,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(datos.error || "No se pudo registrar el usuario.");
      }

      setMensaje("Cuenta creada correctamente. El usuario ya puede iniciar sesión.");

      setNombre("");
      setCorreo("");
      setRol("");
      setContrasena("");
      setConfirmarContrasena("");

      if (alRegistrar) {
        alRegistrar();
      }
    } catch (error) {
      setMensaje("Error: " + error.message);
    } finally {
      setGuardando(false);
    }
  }

  const estiloCampo = {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    marginBottom: "18px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#334155",
  };

  const estiloEtiqueta = {
    color: "#334155",
    display: "block",
    marginBottom: "8px",
    fontWeight: "500",
  };

  return (
    <section style={{ marginTop: "35px" }}>
      <h2 style={{ color: "#194b78", marginBottom: "20px" }}>
        Registrar usuario
      </h2>

      <form onSubmit={registrarUsuario}>
        <label htmlFor="nombreUsuario" style={estiloEtiqueta}>
          Nombre completo
        </label>

        <input
          id="nombreUsuario"
          type="text"
          value={nombre}
          onChange={(evento) => setNombre(evento.target.value)}
          placeholder="Ingresa el nombre completo"
          maxLength={100}
          required
          style={estiloCampo}
        />

        <label htmlFor="correoUsuario" style={estiloEtiqueta}>
          Correo electrónico
        </label>

        <input
          id="correoUsuario"
          type="email"
          value={correo}
          onChange={(evento) => setCorreo(evento.target.value)}
          placeholder="ejemplo@biblio.com"
          required
          style={estiloCampo}
        />

        <label htmlFor="rolUsuario" style={estiloEtiqueta}>
          Rol
        </label>

        <select
          id="rolUsuario"
          value={rol}
          onChange={(evento) => setRol(evento.target.value)}
          required
          style={estiloCampo}
        >
          <option value="">Selecciona un rol</option>
          <option value="estudiante">Estudiante</option>
          <option value="docente">Docente</option>
        </select>

        <label htmlFor="contrasenaUsuario" style={estiloEtiqueta}>
          Contraseña inicial
        </label>

        <input
          id="contrasenaUsuario"
          type="password"
          value={contrasena}
          onChange={(evento) => setContrasena(evento.target.value)}
          placeholder="Ingresa una contraseña"
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          required
          style={estiloCampo}
        />

        <label htmlFor="confirmarContrasenaUsuario" style={estiloEtiqueta}>
          Confirmar contraseña
        </label>

        <input
          id="confirmarContrasenaUsuario"
          type="password"
          value={confirmarContrasena}
          onChange={(evento) =>
            setConfirmarContrasena(evento.target.value)
          }
          placeholder="Vuelve a escribir la contraseña"
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
            backgroundColor: "#194b78",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: guardando ? "not-allowed" : "pointer",
            opacity: guardando ? 0.6 : 1,
          }}
        >
          {guardando ? "Registrando..." : "Registrar usuario"}
        </button>
      </form>

      {mensaje && (
        <p
          role="status"
          style={{
            marginTop: "15px",
            color: mensaje.startsWith("Error") ? "#b91c1c" : "#166534",
          }}
        >
          {mensaje}
        </p>
      )}
    </section>
  );
}
