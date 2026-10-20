"use client";

import { useState } from "react";
import { crearClienteSupabase } from "@/lib/supabaseClient";
import { UserPlus, Plus, Eye, EyeOff } from "lucide-react";
import styles from "./FormularioLibro.module.css";

export default function FormularioRegistrarUsuario({ alRegistrar }) {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

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

  
  return (
    <section className={styles.tarjeta}>

      <div className={styles.encabezado}>
        <div className={styles.icono}>
          <UserPlus size={25} />
        </div>

        <div>
          <h2>Registrar nuevo usuario</h2>
          <p>
            Crea cuentas para estudiantes y docentes de la biblioteca.
          </p>
        </div>
      </div>

      <form onSubmit={registrarUsuario}>

        <div className={styles.campos}>

          <div className={styles.grupo}>
            <label htmlFor="nombreUsuario">
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
            />
          </div>

          <div className={styles.grupo}>
            <label htmlFor="correoUsuario">
              Correo electrónico
            </label>

            <input
              id="correoUsuario"
              type="email"
              value={correo}
              onChange={(evento) => setCorreo(evento.target.value)}
              placeholder="ejemplo@biblio.com"
              required
            />
          </div>

          <div className={styles.grupo}>
            <label htmlFor="rolUsuario">
              Rol
            </label>

            <select
              id="rolUsuario"
              value={rol}
              onChange={(evento) => setRol(evento.target.value)}
              required
            >
              <option value="">Selecciona un rol</option>
              <option value="estudiante">Estudiante</option>
              <option value="docente">Docente</option>
            </select>
          </div>

          <div className={styles.grupo}>
            <label htmlFor="contrasenaUsuario">
              Contraseña inicial
            </label>

            <div className={styles.campoContrasena}>
              <input
                id="contrasenaUsuario"
                type={mostrarContrasena ? "text" : "password"}
                value={contrasena}
                onChange={(evento) =>
                  setContrasena(evento.target.value)
                }
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarContrasena(!mostrarContrasena)
                }
                aria-label={
                  mostrarContrasena
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {mostrarContrasena
                  ? <EyeOff size={19} />
                  : <Eye size={19} />}
              </button>
            </div>
          </div>

          <div className={styles.grupo}>
            <label htmlFor="confirmarContrasenaUsuario">
              Confirmar contraseña
            </label>

            <div className={styles.campoContrasena}>
              <input
                id="confirmarContrasenaUsuario"
                type={
                  mostrarConfirmacion ? "text" : "password"
                }
                value={confirmarContrasena}
                onChange={(evento) =>
                  setConfirmarContrasena(evento.target.value)
                }
                placeholder="Repite la contraseña"
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() =>
                  setMostrarConfirmacion(!mostrarConfirmacion)
                }
                aria-label={
                  mostrarConfirmacion
                    ? "Ocultar confirmación"
                    : "Mostrar confirmación"
                }
              >
                {mostrarConfirmacion
                  ? <EyeOff size={19} />
                  : <Eye size={19} />}
              </button>
            </div>
          </div>

        </div>

        <div className={styles.acciones}>
          <button type="submit" disabled={guardando}>
            <Plus size={18} />

            {guardando
              ? "Registrando..."
              : "Registrar usuario"}
          </button>
        </div>

      </form>

      {mensaje && (
        <p
          role="status"
          className={
            mensaje.startsWith("Error")
              ? styles.mensajeError
              : styles.mensaje
          }
        >
          {mensaje}
        </p>
      )}

    </section>
  );
}