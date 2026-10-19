"use client";

import { useState } from "react";
import styles from "@/app/page.module.css";
import { iniciarSesion, registrarCuenta } from "@/services/authService";
import { useRouter } from "next/navigation";

import {
  LibraryBig,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  UserRound,
  GraduationCap,
  LogIn
} from "lucide-react";

export default function LoginForm() {
  const router = useRouter();

  const [modoRegistro, setModoRegistro] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [rol, setRol] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [esError, setEsError] = useState(false);

  async function manejarEnvio(evento) {
    evento.preventDefault();

    if (cargando) return;

    setMensaje("");
    setCargando(true);
    setEsError(false);

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
          rol,
        );

        if (resultado.requiereConfirmacion) {
          setMensaje(
            "Registro solicitado. Revisa tu correo para confirmar la cuenta.",
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
          } else if (resultado.usuario.rol === "estudiante") {
            router.replace("/estudiante");
          } else if (resultado.usuario.rol === "docente") {
            router.replace("/docente");
          } else {
            setEsError(true);
            setMensaje("No tienes un rol válido para ingresar.");
          }
        } else {
          setEsError(true);
          setMensaje(resultado.mensaje);
        }
      }
    } catch (error) {
      setEsError(true);
      setMensaje("Error: " + error.message);
    } finally {
      setCargando(false);
    }
  }

  function cambiarModo() {
    setModoRegistro(!modoRegistro);
    setMostrarContrasena(false);
    setMensaje("");
    setEsError(false);
    setNombre("");
    setCorreo("");
    setContrasena("");
    setConfirmarContrasena("");
    setRol("");
  }

 
  return (
    <div className={styles.tarjetaLogin}>

      <div className={styles.encabezadoLogin}>
        <div className={styles.logoLogin}>
          <LibraryBig size={32} strokeWidth={1.6} />
        </div>

        <h1>
          {modoRegistro ? "Crea tu cuenta" : "Bienvenido de nuevo"}
        </h1>

        <p>
          {modoRegistro
            ? "Regístrate para acceder a los servicios de nuestra biblioteca."
            : "Ingresa a tu cuenta para consultar tus préstamos y servicios."}
        </p>
      </div>

      <form
        className={styles.formularioLogin}
        onSubmit={manejarEnvio}
      >

        {modoRegistro && (
          <div className={styles.grupoCampo}>
            <label htmlFor="nombre">Nombre completo</label>

            <div className={styles.campoIcono}>
              <UserRound size={19} />

              <input
                type="text"
                id="nombre"
                placeholder="Ingresa tu nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                maxLength={100}
              />
            </div>
          </div>
        )}

        <div className={styles.grupoCampo}>
          <label htmlFor="correo">Correo electrónico</label>

          <div className={styles.campoIcono}>
            <Mail size={19} />

            <input
              type="email"
              id="correo"
              placeholder="usuario@biblio.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.grupoCampo}>
          <label htmlFor="contrasena">Contraseña</label>

          <div className={styles.campoIcono}>
            <LockKeyhole size={19} />

            <input
              type={mostrarContrasena ? "text" : "password"}
              id="contrasena"
              placeholder="Ingresa tu contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              minLength={modoRegistro ? 6 : undefined}
            />

            <button
              type="button"
              className={styles.botonMostrar}
              onClick={() => setMostrarContrasena(!mostrarContrasena)}
              aria-label={
                mostrarContrasena
                  ? "Ocultar contraseña"
                  : "Mostrar contraseña"
              }
            >
              {mostrarContrasena ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          </div>
        </div>

        {modoRegistro && (
          <>
            <div className={styles.grupoCampo}>
              <label htmlFor="confirmarContrasena">
                Confirmar contraseña
              </label>

              <div className={styles.campoIcono}>
                <LockKeyhole size={19} />

                <input
                  type="password"
                  id="confirmarContrasena"
                  placeholder="Confirma tu contraseña"
                  value={confirmarContrasena}
                  onChange={(e) =>
                    setConfirmarContrasena(e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className={styles.grupoCampo}>
              <label htmlFor="rol">Tipo de usuario</label>

              <div className={styles.campoIcono}>
                <GraduationCap size={19} />

                <select
                  id="rol"
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  required
                >
                  <option value="">Selecciona un rol</option>
                  <option value="estudiante">Estudiante</option>
                  <option value="docente">Docente</option>
                </select>
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          className={styles.botonIngresar}
          disabled={cargando}
        >
          <LogIn size={19} />

          {cargando
            ? "Procesando..."
            : modoRegistro
              ? "Crear cuenta"
              : "Iniciar sesión"}
        </button>
      </form>

      {mensaje && (
        <p
          className={`${styles.mensajeLogin} ${
            esError
              ? styles.mensajeError
              : styles.mensajeExito
          }`}
          role="status"
        >
          {mensaje}
        </p>
      )}

      <div className={styles.pieLogin}>
        <p>
          {modoRegistro
            ? "¿Ya tienes una cuenta?"
            : "¿Todavía no tienes cuenta?"}
        </p>

        <button
          type="button"
          onClick={cambiarModo}
          className={styles.botonCambiarModo}
        >
          {modoRegistro
            ? "Inicia sesión aquí"
            : "Regístrate aquí"}
        </button>
      </div>

    </div>
  );
}

