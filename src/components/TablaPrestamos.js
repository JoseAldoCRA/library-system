"use client";

import { useEffect, useState } from "react";
import { listarPrestamosActivos } from "@/services/prestamosService";
import { registrarDevolucion } from "@/services/prestamosService";

export default function TablaPrestamos({ actualizacion, alDevolver }) {
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const [guardandoDevolucion, setGuardandoDevolucion] = useState(false);
  const [mensajeDevolucion, setMensajeDevolucion] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarPrestamos() {
      setCargando(true);
      setError("");

      try {
        const datos = await listarPrestamosActivos();

        if (activo) {
          setPrestamos(datos);
        }
      } catch (error) {
        if (activo) {
          setError(error.message);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarPrestamos();

    return () => {
      activo = false;
    };
  }, [actualizacion]);

  function mostrarFecha(fecha) {
    if (!fecha) return "";

    const partes = fecha.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  async function confirmarDevolucion() {
    if (!prestamoSeleccionado || guardandoDevolucion) {
      return;
    }

    setGuardandoDevolucion(true);
    setMensajeDevolucion("");

    try {
      await registrarDevolucion(prestamoSeleccionado.id_prestamo);

      setMensajeDevolucion("Devolución registrada correctamente.");
      setPrestamoSeleccionado(null);

      if (alDevolver) {
        alDevolver();
      }
    } catch (error) {
      setMensajeDevolucion("Error: " + error.message);
      setPrestamoSeleccionado(null);
    } finally {
      setGuardandoDevolucion(false);
    }
  }

  return (
    <section style={{ marginTop: "35px" }}>
      <h2 style={{ color: "#194b78", marginBottom: "20px" }}>
        Préstamos activos
      </h2>

      {cargando && <p>Cargando préstamos...</p>}

      {error && <p style={{ color: "#b91c1c" }}>Error: {error}</p>}

      {!cargando && !error && prestamos.length === 0 && (
        <p style={{ color: "#334155" }}>No hay préstamos activos.</p>
      )}

      {!cargando && !error && prestamos.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              color: "#334155",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#194b78", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Usuario</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Ejemplar</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Libro</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Préstamo</th>
                <th style={{ padding: "12px", textAlign: "left" }}>
                  Vencimiento
                </th>
                <th style={{ padding: "12px", textAlign: "left" }}>Estado</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {prestamos.map((prestamo) => (
                <tr key={prestamo.id_prestamo}>
                  <td style={estiloCelda}>{prestamo.usuario}</td>
                  <td style={estiloCelda}>{prestamo.ejemplar}</td>
                  <td style={estiloCelda}>{prestamo.libro}</td>
                  <td style={estiloCelda}>
                    {mostrarFecha(prestamo.fecha_prestamo)}
                  </td>
                  <td style={estiloCelda}>
                    {mostrarFecha(prestamo.fecha_vencimiento)}
                  </td>

                  <td style={estiloCelda}>{prestamo.estado}</td>

                  <td style={estiloCelda}>
                    <button
                      type="button"
                      onClick={() => setPrestamoSeleccionado(prestamo)}
                      style={{
                        backgroundColor: "#194b78",
                        color: "white",
                        padding: "10px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Registrar devolución
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {prestamoSeleccionado && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloConfirmarDevolucion"
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "500px",
              overflow: "hidden",
            }}
          >
            <h2
              id="tituloConfirmarDevolucion"
              style={{
                backgroundColor: "#194b78",
                color: "white",
                padding: "20px",
                margin: 0,
              }}
            >
              Confirmar devolución
            </h2>

            <div style={{ padding: "25px", color: "#334155" }}>
              <p>¿Deseas registrar la devolución de este préstamo?</p>

              <p style={{ marginTop: "15px" }}>
                <strong>Usuario:</strong> {prestamoSeleccionado.usuario}
              </p>

              <p style={{ marginTop: "10px" }}>
                <strong>Ejemplar:</strong> {prestamoSeleccionado.ejemplar}
              </p>

              <p style={{ marginTop: "10px" }}>
                <strong>Libro:</strong> {prestamoSeleccionado.libro}
              </p>

              <p style={{ marginTop: "10px" }}>
                <strong>Fecha de vencimiento:</strong>{" "}
                {mostrarFecha(prestamoSeleccionado.fecha_vencimiento)}
              </p>

              <p
                style={{
                  marginTop: "20px",
                  padding: "12px",
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "6px",
                }}
              >
                El ejemplar volverá a estar disponible. Si existe retraso, se
                registrará una multa de $10 MXN por día.
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "25px",
                }}
              >
                <button
                  type="button"
                  disabled={guardandoDevolucion}
                  onClick={() => setPrestamoSeleccionado(null)}
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#e2e8f0",
                    color: "#334155",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={guardandoDevolucion}
                  onClick={confirmarDevolucion}
                  style={{
                    padding: "12px 16px",
                    backgroundColor: "#166534",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    opacity: guardandoDevolucion ? 0.6 : 1,
                  }}
                >
                  {guardandoDevolucion
                    ? "Registrando..."
                    : "Sí, registrar devolución"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mensajeDevolucion && (
        <p
          role="status"
          style={{
            marginTop: "15px",
            color: mensajeDevolucion.startsWith("Error")
              ? "#b91c1c"
              : "#166534",
          }}
        >
          {mensajeDevolucion}
        </p>
      )}
    </section>
  );
}

const estiloCelda = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
  backgroundColor: "#ffffff",
  color: "#334155",
};
