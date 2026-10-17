"use client";

import { useState } from "react";
import styles from "@/app/page.module.css";
import { iniciarSesion, registrarCuenta } from "@/services/authService";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();

  const [modoRegistro, setModoRegistro] = useState(false);

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [rol, setRol] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarEnvio(evento) {
    evento.preventDefault();

    if (cargando) return;

    setMensaje("");
    setCargando(true);

    try {
      if (modoRegistro) {
        if (contrasena.length < 6) {
          throw new Error("La contraseña debe tener al menos 6 caracteres.");
        }

        if (contrasena !== confirmarContrasena) {
          throw new Error("Las contraseñas no coinciden.");
        }

        if (rol !== "estudiante" && rol !== "docente") {
          throw new Error("Selecciona un rol válido.");
        }

        const resultado = await registrarCuenta(
          nombre,
          correo,
          contrasena,
          rol
        );

        if (resultado.requiereConfirmacion) {
          setMensaje(
            "Registro solicitado. Revisa tu correo para confirmar la cuenta."
          );
        } else {
          setMensaje("Cuenta creada correctamente. Ya puedes iniciar sesión.");
        }

        setNombre("");
        setCorreo("");
        setContrasena("");
        setConfirmarContrasena("");
        setRol("");

      } else {
        const resultado = await iniciarSesion(correo, contrasena);

        if (resultado.exito) {
          if (resultado.usuario.rol === "bibliotecario") {
            router.replace("/bibliotecario");
          } else {
            setMensaje("Bienvenido, " + resultado.usuario.nombre);
          }
        } else {
          setMensaje(resultado.mensaje);
        }
      }
    } catch (error) {
      setMensaje("Error: " + error.message);
    } finally {
      setCargando(false);
    }
  }

  function cambiarModo() {
    setModoRegistro(!modoRegistro);
    setMensaje("");
    setNombre("");
    setCorreo("");
    setContrasena("");
    setConfirmarContrasena("");
    setRol("");
  }

  return (
    <div className={styles.tarjeta}>
      <h1>Sistema de Biblioteca</h1>

      <h2>{modoRegistro ? "Crear cuenta" : "Iniciar sesión"}</h2>

      <form className={styles.formulario} onSubmit={manejarEnvio}>

        {modoRegistro && (
          <>
            <label htmlFor="nombre">Nombre completo</label>
            <input
              type="text"
              id="nombre"
              placeholder="Ingresa tu nombre completo"
              value={nombre}
              onChange={(evento) => setNombre(evento.target.value)}
              required
              maxLength={100}
            />
          </>
        )}

        <label htmlFor="correo">Correo electrónico</label>
        <input
          type="email"
          id="correo"
          placeholder="usuario@biblio.com"
          value={correo}
          onChange={(evento) => setCorreo(evento.target.value)}
          required
        />

        <label htmlFor="contrasena">Contraseña</label>
        <input
          type="password"
          id="contrasena"
          placeholder="Ingresa tu contraseña"
          value={contrasena}
          onChange={(evento) => setContrasena(evento.target.value)}
          required
          minLength={modoRegistro ? 6 : undefined}
        />

        {modoRegistro && (
          <>
            <label htmlFor="confirmarContrasena">
              Confirmar contraseña
            </label>
            <input
              type="password"
              id="confirmarContrasena"
              placeholder="Vuelve a escribir tu contraseña"
              value={confirmarContrasena}
              onChange={(evento) =>
                setConfirmarContrasena(evento.target.value)
              }
              required
            />

            <label htmlFor="rol">Rol</label>
            <select
              id="rol"
              value={rol}
              onChange={(evento) => setRol(evento.target.value)}
              required
              style={{
                padding: "12px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                backgroundColor: "white",
                color: "#334155",
              }}
            >
              <option value="">Selecciona un rol</option>
              <option value="estudiante">Estudiante</option>
              <option value="docente">Docente</option>
            </select>
          </>
        )}

        <button type="submit" disabled={cargando}>
          {cargando
            ? "Procesando..."
            : modoRegistro
              ? "Crear cuenta"
              : "Ingresar"}
        </button>
      </form>

      {mensaje && (
        <p
          className={styles.aviso}
          role="status"
          style={{
            color: mensaje.startsWith("Error") ? "#b91c1c" : "#166534",
          }}
        >
          {mensaje}
        </p>
      )}

      <p className={styles.registro}>
        {modoRegistro
          ? "¿Ya tienes una cuenta? "
          : "¿No tienes cuenta? "}

        <button
          type="button"
          onClick={cambiarModo}
          style={{
            border: "none",
            background: "none",
            color: "#194b78",
            fontWeight: "bold",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {modoRegistro ? "Inicia sesión aquí" : "Regístrate aquí"}
        </button>
      </p>
    </div>
  );
}