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

  return (
    <section style={{ marginTop: "35px" }}>
      <h2 style={{ color: "#194b78", marginBottom: "20px" }}>
        Registrar préstamo
      </h2>

      {cargando && <p>Cargando usuarios y ejemplares...</p>}

      {!cargando && (
        <form onSubmit={registrarPrestamo}>
          <label
            htmlFor="usuarioPrestamo"
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#334155",
              fontWeight: "500",
            }}
          >
            Usuario
          </label>

          <select
            id="usuarioPrestamo"
            value={usuario}
            onChange={(evento) => setUsuario(evento.target.value)}
            required
            style={estiloCampo}
          >
            <option value="">Selecciona un estudiante o docente</option>

            {usuarios.map((item) => (
              <option key={item.id_usuario} value={item.id_usuario}>
                {item.nombre} ({item.rol})
              </option>
            ))}
          </select>

          <label
            htmlFor="ejemplarPrestamo"
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#334155",
              fontWeight: "500",
            }}
          >
            Ejemplar disponible
          </label>

          <select
            id="ejemplarPrestamo"
            value={ejemplar}
            onChange={(evento) => setEjemplar(evento.target.value)}
            required
            style={estiloCampo}
          >
            <option value="">Selecciona un ejemplar</option>

            {ejemplares.map((item) => (
              <option key={item.id_ejemplar} value={item.id_ejemplar}>
                {item.codigo} - {item.libros?.titulo}
              </option>
            ))}
          </select>

          <div style={{ marginBottom: "25px" }}>
            <label
              htmlFor="fechaVencimiento"
              style={{
                display: "block",
                marginBottom: "8px",
                color: "#334155",
                fontWeight: "500",
              }}
            >
              Fecha de vencimiento
            </label>

            <DatePicker
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
              placeholderText="Selecciona la fecha de vencimiento"
              locale="es"
              showPopperArrow={false}
              className="calendario-prestamo"
              wrapperClassName="calendario-contenedor"
            />
          </div>

          <button
            type="submit"
            disabled={
              guardando || usuarios.length === 0 || ejemplares.length === 0
            }
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
            {guardando ? "Registrando..." : "Registrar préstamo"}
          </button>
        </form>
      )}

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
