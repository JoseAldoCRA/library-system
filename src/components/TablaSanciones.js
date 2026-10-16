"use client";

import { useEffect, useState } from "react";
import {
  listarSanciones,
  registrarNuevoPago,
} from "@/services/sancionesService";

export default function TablaSanciones({ actualizacion }) {
  const [sanciones, setSanciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [sancionSeleccionada, setSancionSeleccionada] = useState(null);
  const [guardandoPago, setGuardandoPago] = useState(false);
  const [mensajePago, setMensajePago] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarSanciones() {
      setCargando(true);
      setError("");

      try {
        const datos = await listarSanciones();

        if (activo) {
          setSanciones(datos);
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

    cargarSanciones();

    return () => {
      activo = false;
    };
  }, [actualizacion]);

  async function confirmarPago() {
    if (!sancionSeleccionada || guardandoPago) {
      return;
    }

    setGuardandoPago(true);
    setMensajePago("");

    try {
      await registrarNuevoPago(sancionSeleccionada.id_sancion);

      setMensajePago("Pago registrado correctamente.");
      setSancionSeleccionada(null);

      const datos = await listarSanciones();
      setSanciones(datos);
    } catch (error) {
      setMensajePago("Error: " + error.message);
    } finally {
      setGuardandoPago(false);
    }
  }

  function mostrarFecha(fecha) {
    if (!fecha) return "-";

    const partes = fecha.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  const estiloCelda = {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#ffffff",
    color: "#334155",
  };

  return (
    <section style={{ marginTop: "35px" }}>
      <h2 style={{ color: "#194b78", marginBottom: "20px" }}>
        Sanciones y multas
      </h2>

      {cargando && <p>Cargando sanciones...</p>}

      {error && <p style={{ color: "#b91c1c" }}>Error: {error}</p>}

      {!cargando && !error && sanciones.length === 0 && (
        <p>No hay sanciones registradas.</p>
      )}

      {!cargando && !error && sanciones.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              color: "#334155",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#194b78",
                  color: "white",
                }}
              >
                <th style={{ padding: "12px", textAlign: "left" }}>Usuario</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Libro</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Ejemplar</th>
                <th style={{ padding: "12px", textAlign: "left" }}>
                  Vencimiento
                </th>
                <th style={{ padding: "12px", textAlign: "left" }}>
                  Devolución
                </th>
                <th style={{ padding: "12px", textAlign: "left" }}>
                  Días de retraso
                </th>
                <th style={{ padding: "12px", textAlign: "left" }}>Multa</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Estado</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {sanciones.map((sancion) => (
                <tr key={sancion.id_sancion}>
                  <td style={estiloCelda}>{sancion.usuario}</td>
                  <td style={estiloCelda}>{sancion.libro}</td>
                  <td style={estiloCelda}>{sancion.ejemplar}</td>
                  <td style={estiloCelda}>
                    {mostrarFecha(sancion.fecha_vencimiento)}
                  </td>
                  <td style={estiloCelda}>
                    {mostrarFecha(sancion.fecha_devolucion)}
                  </td>
                  <td style={estiloCelda}>{sancion.dias_retraso}</td>
                  <td style={estiloCelda}>${sancion.monto.toFixed(2)} MXN</td>
                  <td style={estiloCelda}>
                    {sancion.estado_pago === "pendiente"
                      ? "Pendiente"
                      : "Pagado"}
                  </td>

                  <td style={estiloCelda}>
                    {sancion.estado_pago === "pendiente" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setMensajePago("");
                          setSancionSeleccionada(sancion);
                        }}
                        style={{
                          backgroundColor: "#166534",
                          color: "white",
                          padding: "10px 14px",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Registrar pago
                      </button>
                    ) : (
                      <span style={{ color: "#166534" }}>Pagado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sancionSeleccionada && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloConfirmarPago"
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "550px",
              padding: "25px",
              color: "#334155",
            }}
          >
            <h2
              id="tituloConfirmarPago"
              style={{ color: "#194b78", marginBottom: "20px" }}
            >
              Confirmar pago de multa
            </h2>

            <p>¿Deseas registrar el pago de esta sanción?</p>

            <p>
              <strong>Usuario:</strong> {sancionSeleccionada.usuario}
            </p>
            <p>
              <strong>Libro:</strong> {sancionSeleccionada.libro}
            </p>
            <p>
              <strong>Ejemplar:</strong> {sancionSeleccionada.ejemplar}
            </p>
            <p>
              <strong>Días de retraso:</strong>{" "}
              {sancionSeleccionada.dias_retraso}
            </p>
            <p>
              <strong>Multa:</strong> ${sancionSeleccionada.monto.toFixed(2)}{" "}
              MXN
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "25px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                disabled={guardandoPago}
                onClick={() => setSancionSeleccionada(null)}
                style={{
                  padding: "12px 18px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  backgroundColor: "#e2e8f0",
                  color: "#334155",
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={guardandoPago}
                onClick={confirmarPago}
                style={{
                  padding: "12px 18px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: guardandoPago ? "not-allowed" : "pointer",
                  backgroundColor: "#166534",
                  color: "white",
                }}
              >
                {guardandoPago ? "Registrando..." : "Sí, registrar pago"}
              </button>
            </div>
          </div>
        </div>
      )}

      {mensajePago && (
        <p
          role="status"
          style={{
            marginTop: "15px",
            color: mensajePago.startsWith("Error") ? "#b91c1c" : "#166534",
          }}
        >
          {mensajePago}
        </p>
      )}
    </section>
  );
}
