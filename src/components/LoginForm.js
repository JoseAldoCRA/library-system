"use client";

import { useState } from "react";
import styles from "@/app/page.module.css";
import { iniciarSesion } from "@/services/authService";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  async function manejarEnvio(evento) {
    evento.preventDefault();

    setMensaje("");
    setCargando(true);

    try {
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
    } catch (error) {
      setMensaje("Ocurrió un error al iniciar sesión.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className={styles.tarjeta}>
      <h1>Sistema de Biblioteca</h1>
      <h2>Iniciar sesión</h2>

      <form className={styles.formulario} onSubmit={manejarEnvio}>
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
        />

        <button type="submit" disabled={cargando}>
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      {mensaje && (
        <p className={styles.aviso} role="status">
          {mensaje}
        </p>
      )}

      <p className={styles.registro}>
        ¿No tienes cuenta? <span>Regístrate aquí</span>
      </p>
    </div>
  );
}
