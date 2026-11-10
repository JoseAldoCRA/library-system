"use client";

import { useEffect, useRef, useState } from "react";
import { crearClienteSupabase } from "@/lib/supabaseClient";
import { UserPlus, Plus, Eye, EyeOff, SlidersHorizontal } from "lucide-react";
import styles from "./FormularioLibro.module.css";
import estilosCategorias from "@/app/catalogo.module.css";

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

  const [menuRolesAbierto, setMenuRolesAbierto] = useState(false);
  const [busquedaRol, setBusquedaRol] = useState("");
  const selectorRolRef = useRef(null);

  const opcionesRol = [
    { valor: "estudiante", nombre: "Estudiante" },
    { valor: "docente", nombre: "Docente" },
  ];

  const rolSeleccionado =
    opcionesRol.find((opcion) => opcion.valor === rol)?.nombre ||
    "Selecciona un rol";

  const rolesVisibles = opcionesRol.filter((opcion) =>
    opcion.nombre.toLowerCase().includes(busquedaRol.toLowerCase().trim()),
  );

  useEffect(() => {
    function cerrarSelector(evento) {
      if (
        selectorRolRef.current &&
        !selectorRolRef.current.contains(evento.target)
      ) {
        setMenuRolesAbierto(false);
        setBusquedaRol("");
      }
    }

    function cerrarConEscape(evento) {
      if (evento.key === "Escape") {
        setMenuRolesAbierto(false);
        setBusquedaRol("");
      }
    }

    document.addEventListener("mousedown", cerrarSelector);
    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.removeEventListener("mousedown", cerrarSelector);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, []);

  async function registrarUsuario(evento) {
    evento.preventDefault();

    if (guardando) return;

    setMensaje("");

    if (!rol) {
      setMensaje("Error: Selecciona un rol antes de registrar el usuario.");
      return;
    }

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

      setMensaje(
        "Cuenta creada correctamente. El usuario ya puede iniciar sesión.",
      );

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
          <p>Crea cuentas para estudiantes y docentes de la biblioteca.</p>
        </div>
      </div>

      <form onSubmit={registrarUsuario}>
        <div className={styles.campos}>
          <div className={styles.grupo}>
            <label htmlFor="nombreUsuario">Nombre completo</label>

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
            <label htmlFor="correoUsuario">Correo electrónico</label>

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
            <label htmlFor="rolUsuario">Rol</label>
            <div
              ref={selectorRolRef}
              className={estilosCategorias.filtroCategoriaModerno}
              style={{ width: "100%", marginLeft: 0 }}
            >
              <button
                id="rolUsuario"
                type="button"
                className={estilosCategorias.botonFiltroCategorias}
                style={{
                  height: "49px",
                  minHeight: "49px",
                  padding: "0 16px",
                  boxSizing: "border-box",
                }}
                aria-expanded={menuRolesAbierto}
                aria-controls="lista-roles-usuario"
                aria-required="true"
                onClick={() => {
                  setMenuRolesAbierto(!menuRolesAbierto);
                  setBusquedaRol("");
                }}
              >
                <SlidersHorizontal size={19} />

                <span>{rolSeleccionado}</span>

                <span className={estilosCategorias.flechaCategoria}>
                  {menuRolesAbierto ? "⌃" : "⌄"}
                </span>
              </button>

              {menuRolesAbierto && (
                <div
                  id="lista-roles-usuario"
                  className={estilosCategorias.panelCategorias}
                >
                  <input
                    type="search"
                    className={estilosCategorias.buscarCategoria}
                    placeholder="Buscar rol..."
                    aria-label="Buscar rol"
                    value={busquedaRol}
                    onChange={(evento) => setBusquedaRol(evento.target.value)}
                  />

                  <div className={estilosCategorias.listaCategorias}>
                    {rolesVisibles.map((opcion) => (
                      <button
                        key={opcion.valor}
                        type="button"
                        className={`${estilosCategorias.opcionCategoria} ${
                          rol === opcion.valor
                            ? estilosCategorias.categoriaActiva
                            : ""
                        }`}
                        onClick={() => {
                          setRol(opcion.valor);
                          setMenuRolesAbierto(false);
                          setBusquedaRol("");
                        }}
                      >
                        <span>{opcion.nombre}</span>
                        {rol === opcion.valor && <span>✓</span>}
                      </button>
                    ))}

                    {rolesVisibles.length === 0 && (
                      <p className={estilosCategorias.sinCategorias}>
                        No se encontraron roles.
                      </p>
                    )}
                  </div>

                  <div className={estilosCategorias.pieCategorias}>
                    2 roles disponibles
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.grupo}>
            <label htmlFor="contrasenaUsuario">Contraseña inicial</label>

            <div className={styles.campoContrasena}>
              <input
                id="contrasenaUsuario"
                type={mostrarContrasena ? "text" : "password"}
                value={contrasena}
                onChange={(evento) => setContrasena(evento.target.value)}
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                required
              />

              <button
                type="button"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
                aria-label={
                  mostrarContrasena
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {mostrarContrasena ? <EyeOff size={19} /> : <Eye size={19} />}
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
                type={mostrarConfirmacion ? "text" : "password"}
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
                onClick={() => setMostrarConfirmacion(!mostrarConfirmacion)}
                aria-label={
                  mostrarConfirmacion
                    ? "Ocultar confirmación"
                    : "Mostrar confirmación"
                }
              >
                {mostrarConfirmacion ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.acciones}>
          <button type="submit" disabled={guardando}>
            <Plus size={18} />

            {guardando ? "Registrando..." : "Registrar usuario"}
          </button>
        </div>
      </form>

      {mensaje && (
        <p
          role="status"
          className={
            mensaje.startsWith("Error") ? styles.mensajeError : styles.mensaje
          }
        >
          {mensaje}
        </p>
      )}
    </section>
  );
}
