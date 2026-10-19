"use client";

import { useEffect, useState } from "react";
import { listarMisSanciones } from "@/services/sancionesService";

export default function TablaMisSanciones() {
  const [sanciones, setSanciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarSanciones() {
      try {
        const datos = await listarMisSanciones();

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
  }, []);

  function mostrarFecha(fecha) {
    if (!fecha) {
      return "-";
    }

    const [anio, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${anio}`;
  }

  const estiloCelda = {
    padding: "12px",
    color: "#334155",
  };

  const estiloEncabezado = {
    padding: "12px",
    color: "#194b78",
  };

  return (
    <section style={{ marginTop: "35px" }}>
      <h2 style={{ color: "#194b78", marginBottom: "20px" }}>Mis sanciones</h2>

      {cargando && <p>Cargando sanciones...</p>}

      {error && (
        <p role="alert" style={{ color: "#b91c1c" }}>
          Error: {error}
        </p>
      )}

      {!cargando && !error && sanciones.length === 0 && (
        <p
          style={{
            marginTop: "15px",
            color: "#334155",
          }}
        >
          No tienes sanciones registradas.
        </p>
      )}

      {!cargando && !error && sanciones.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#eff6ff" }}>
                <th style={estiloEncabezado}>Libro</th>
                <th style={estiloEncabezado}>Ejemplar</th>
                <th style={estiloEncabezado}>Vencimiento</th>
                <th style={estiloEncabezado}>Días de retraso</th>
                <th style={estiloEncabezado}>Monto</th>
                <th style={estiloEncabezado}>Estado</th>
              </tr>
            </thead>

            <tbody>
              {sanciones.map((sancion) => (
                <tr
                  key={sancion.id_sancion}
                  style={{ borderBottom: "1px solid #e2e8f0" }}
                >
                  <td style={estiloCelda}>{sancion.libro}</td>

                  <td style={estiloCelda}>{sancion.ejemplar}</td>

                  <td style={estiloCelda}>
                    {mostrarFecha(sancion.fecha_vencimiento)}
                  </td>

                  <td style={estiloCelda}>{sancion.dias_retraso}</td>

                  <td style={estiloCelda}>${sancion.monto.toFixed(2)}</td>

                  <td
                    style={{
                      ...estiloCelda,
                      fontWeight: "bold",
                      color:
                        sancion.estado_pago === "pagado"
                          ? "#166534"
                          : "#b45309",
                    }}
                  >
                    {sancion.estado_pago === "pagado"
                      ? "Pagado"
                      : sancion.estado_pago === "pendiente"
                        ? "Pendiente"
                        : sancion.estado_pago}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
