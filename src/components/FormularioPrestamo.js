"use client";

import { useEffect, useState } from "react";
import { crearClienteSupabase } from "@/lib/supabaseClient";
import { registrarNuevoPrestamo } from "@/services/prestamosService";
import { obtenerUsuariosPrestamo } from "@/repositories/usuariosRepository";
import { obtenerEjemplaresDisponibles } from "@/repositories/ejemplaresRepository";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import { registerLocale } from "react-datepicker";
import { Handshake, Plus, CalendarDays } from "lucide-react";
import styles from "./FormularioLibro.module.css";

registerLocale("es", es);

export default function FormularioPrestamo({ alRegistrar, actualizacion }) {
  const [usuarios, setUsuarios] = useState([]);
  const [ejemplares, setEjemplares] = useState([]);
  const [usuario, setUsuario] = useState("");
  const [ejemplar, setEjemplar] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      setCargando(true);

      try {
        const datosUsuarios = await obtenerUsuariosPrestamo();
        const datosEjemplares = await obtenerEjemplaresDisponibles();

        if (activo) {
          setUsuarios(datosUsuarios);
          setEjemplares(datosEjemplares);
        }
      } catch (error) {
        if (activo) {
          setMensaje("Error: " + error.message);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarDatos();

    return () => {
      activo = false;
    };
  }, [actualizacion]);

  async function registrarPrestamo(evento) {
    evento.preventDefault();

    if (guardando) return;

    setMensaje("");
    setGuardando(true);

    try {
      await registrarNuevoPrestamo({
        id_usuario: usuario,
        id_ejemplar: ejemplar,
        fecha_vencimiento: fechaVencimiento,
      });

      setMensaje("Préstamo registrado correctamente.");

      setUsuario("");
      setEjemplar("");
      setFechaVencimiento("");
      setFechaSeleccionada(null);

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
          <Handshake size={25} />
        </div>

        <div>
          <h2>Registrar nuevo préstamo</h2>
          <p>
            Selecciona el usuario, el ejemplar y la fecha de vencimiento.
          </p>
        </div>
      </div>

      {cargando && (
        <p className={styles.mensaje}>
          Cargando usuarios y ejemplares...
        </p>
      )}

      {!cargando && (
        <form onSubmit={registrarPrestamo}>

          <div className={styles.campos}>

            <div className={styles.grupo}>
              <label htmlFor="usuarioPrestamo">Usuario</label>

              <select
                id="usuarioPrestamo"
                value={usuario}
                onChange={(evento) => setUsuario(evento.target.value)}
                required
              >
                <option value="">
                  Selecciona un estudiante o docente
                </option>

                {usuarios.map((item) => (
                  <option
                    key={item.id_usuario}
                    value={item.id_usuario}
                  >
                    {item.nombre} (
                    {item.rol === "estudiante"
                      ? "Estudiante"
                      : "Docente"})
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.grupo}>
              <label htmlFor="ejemplarPrestamo">
                Ejemplar disponible
              </label>

              <select
                id="ejemplarPrestamo"
                value={ejemplar}
                onChange={(evento) => setEjemplar(evento.target.value)}
                required
              >
                <option value="">
                  Selecciona un ejemplar
                </option>

                {ejemplares.map((item) => (
                  <option
                    key={item.id_ejemplar}
                    value={item.id_ejemplar}
                  >
                    {item.codigo} - {item.libros?.titulo}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.grupo}>
              <label htmlFor="fechaVencimiento">
                Fecha de vencimiento
              </label>

              <div className={styles.campoCalendario}>
                <CalendarDays size={19} />

                <DatePicker
                  id="fechaVencimiento"
                  selected={fechaSeleccionada}
                  onChange={(fecha) => {
                    setFechaSeleccionada(fecha);

                    if (fecha) {
                      const anio = fecha.getFullYear();
                      const mes = String(fecha.getMonth() + 1).padStart(2, "0");
                      const dia = String(fecha.getDate()).padStart(2, "0");

                      setFechaVencimiento(
                        `${anio}-${mes}-${dia}`
                      );
                    } else {
                      setFechaVencimiento("");
                    }
                  }}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Selecciona la fecha"
                  locale="es"
                  showPopperArrow={false}
                  className="calendario-prestamo"
                  wrapperClassName="calendario-contenedor"
                  required
                />
              </div>
            </div>

          </div>

          <div className={styles.acciones}>
            <button
              type="submit"
              disabled={
                guardando ||
                !usuario ||
                !ejemplar ||
                !fechaVencimiento ||
                usuarios.length === 0 ||
                ejemplares.length === 0
              }
            >
              <Plus size={18} />

              {guardando
                ? "Registrando..."
                : "Registrar préstamo"}
            </button>
          </div>

        </form>
      )}

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

