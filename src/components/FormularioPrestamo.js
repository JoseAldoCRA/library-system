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
import SelectorPrestamo from "@/components/SelectorPrestamo";

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
          <p>Selecciona el usuario, el ejemplar y la fecha de vencimiento.</p>
        </div>
      </div>

      {cargando && (
        <p className={styles.mensaje}>Cargando usuarios y ejemplares...</p>
      )}

      {!cargando && (
        <form onSubmit={registrarPrestamo}>
          <div className={styles.campos}>
            <div className={styles.grupo}>
              <label htmlFor="usuarioPrestamo">Usuario</label>

              <SelectorPrestamo
                id="usuarioPrestamo"
                valor={usuario}
                alCambiar={setUsuario}
                opciones={usuarios.map((item) => ({
                  valor: item.id_usuario,
                  texto: `${item.nombre} (${
                    item.rol === "estudiante" ? "Estudiante" : "Docente"
                  })`,
                }))}
                textoInicial="Selecciona un estudiante o docente"
                textoBusqueda="Buscar usuario..."
                deshabilitado={guardando}
              />
            </div>

            <div className={styles.grupo}>
              <label htmlFor="ejemplarPrestamo">Ejemplar disponible</label>

              <SelectorPrestamo
                id="ejemplarPrestamo"
                valor={ejemplar}
                alCambiar={setEjemplar}
                opciones={ejemplares.map((item) => ({
                  valor: item.id_ejemplar,
                  texto: `${item.codigo} - ${item.libros?.titulo || "Sin título"}`,
                }))}
                textoInicial="Selecciona un ejemplar"
                textoBusqueda="Buscar por código o libro..."
                deshabilitado={guardando}
              />
            </div>

            <div className={styles.grupo}>
              <label htmlFor="fechaVencimiento">Fecha de vencimiento</label>

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

                      setFechaVencimiento(`${anio}-${mes}-${dia}`);
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

              {guardando ? "Registrando..." : "Registrar préstamo"}
            </button>
          </div>
        </form>
      )}

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
