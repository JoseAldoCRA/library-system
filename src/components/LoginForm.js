"use client";

import { useState } from "react";
import styles from "@/app/page.module.css";
import { validarCredenciales } from "@/services/authService";

export default function LoginForm() {
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");

  function manejarEnvio(evento) {
    evento.preventDefault();

    const resultado = validarCredenciales(correo, contrasena);

    setMensaje(resultado);
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

        <button type="submit">Ingresar</button>
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
