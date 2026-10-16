"use client";

import { useEffect, useState } from "react";
import { listarPrestamosActivos } from "@/services/prestamosService";

export default function TablaPrestamos({ actualizacion }) {
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <section style={{ marginTop: "35px" }}>
      <h2 style={{ color: "#194b78", marginBottom: "20px" }}>
        Préstamos activos
      </h2>

      {cargando && <p>Cargando préstamos...</p>}

      {error && (
        <p style={{ color: "#b91c1c" }}>
          Error: {error}
        </p>
      )}

      {!cargando && !error && prestamos.length === 0 && (
        <p style={{ color: "#334155" }}>
          No hay préstamos activos.
        </p>
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
                <th style={{ padding: "12px", textAlign: "left" }}>
                  Usuario
                </th>
                <th style={{ padding: "12px", textAlign: "left" }}>
                  Ejemplar
                </th>
                <th style={{ padding: "12px", textAlign: "left" }}>
                  Libro
                </th>
                <th style={{ padding: "12px", textAlign: "left" }}>
                  Préstamo
                </th>
                <th style={{ padding: "12px", textAlign: "left" }}>
                  Vencimiento
                </th>
                <th style={{ padding: "12px", textAlign: "left" }}>
                  Estado
                </th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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