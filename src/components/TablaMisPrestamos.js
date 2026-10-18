"use client";

import { useEffect, useState } from "react";
import { listarMisPrestamos } from "@/services/prestamosService";

export default function TablaMisPrestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarPrestamos() {
      try {
        const datos = await listarMisPrestamos();
        setPrestamos(datos);
      } catch (error) {
        setError(error.message);
      } finally {
        setCargando(false);
      }
    }

    cargarPrestamos();
  }, []);

  function mostrarFecha(fecha) {
    if (!fecha) {
      return "-";
    }

    const [anio, mes, dia] = fecha.split("-");
    return `${dia}/${mes}/${anio}`;
  }

  const estiloEncabezado = {
    padding: "12px",
    color: "#194b78",
  };

  const estiloCelda = {
    padding: "12px",
    color: "#334155",
  };

  if (cargando) {
    return <p>Cargando tus préstamos...</p>;
  }

  return (
    <section style={{ marginTop: "30px" }}>
      <h2 style={{ color: "#194b78" }}>Mis préstamos</h2>

      {error && (
        <p style={{ color: "#b91c1c", marginTop: "15px" }}>Error: {error}</p>
      )}

      {!error && prestamos.length === 0 && (
        <p style={{ marginTop: "15px", color: "#334155" }}>
          No tienes préstamos registrados.
        </p>
      )}

      {!error && prestamos.length > 0 && (
        <div style={{ overflowX: "auto", marginTop: "20px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ background: "#eff6ff" }}>
                <th style={estiloEncabezado}>Libro</th>
                <th style={estiloEncabezado}>Ejemplar</th>
                <th style={estiloEncabezado}>Préstamo</th>
                <th style={estiloEncabezado}>Vencimiento</th>
                <th style={estiloEncabezado}>Estado</th>
              </tr>
            </thead>

            <tbody>
              {prestamos.map((prestamo) => (
                <tr
                  key={prestamo.id_prestamo}
                  style={{ borderBottom: "1px solid #e2e8f0" }}
                >
                  <td style={estiloCelda}>{prestamo.libro}</td>

                  <td style={estiloCelda}>{prestamo.ejemplar}</td>

                  <td style={estiloCelda}>
                    {mostrarFecha(prestamo.fecha_prestamo)}
                  </td>

                  <td style={estiloCelda}>
                    {mostrarFecha(prestamo.fecha_vencimiento)}
                  </td>

                  <td
                    style={{
                      padding: "12px",
                      color:
                        prestamo.estado === "Activo" ? "#b45309" : "#166534",
                      fontWeight: "bold",
                    }}
                  >
                    {prestamo.estado}
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
