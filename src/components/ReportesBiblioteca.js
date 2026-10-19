
"use client";

import { useEffect, useState } from "react";
import { generarReporteBiblioteca } from "@/services/reportesService";

export default function ReportesBiblioteca({ actualizacion }) {
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarReporte() {
      setCargando(true);
      setError("");

      try {
        const datos = await generarReporteBiblioteca();
        setReporte(datos);
      } catch (error) {
        setError(error.message);
      } finally {
        setCargando(false);
      }
    }

    cargarReporte();
  }, [actualizacion]);

  const estiloTitulo = {
    color: "#194b78",
    marginBottom: "15px",
  };

  const estiloTabla = {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "25px",
  };

  const estiloEncabezado = {
    background: "#194b78",
    color: "white",
    padding: "12px",
    textAlign: "left",
  };

  const estiloCelda = {
    padding: "12px",
    color: "#334155",
    borderBottom: "1px solid #e2e8f0",
  };

  return (
    <section style={{ marginTop: "40px" }}>
      <h2 style={estiloTitulo}>Reportes de la biblioteca</h2>

      <p style={{ color: "#334155", marginBottom: "20px" }}>
        Consulta los indicadores generales de la biblioteca.
      </p>

      {cargando && <p>Cargando reportes...</p>}

      {error && (
        <p style={{ color: "#b91c1c" }}>
          Error al cargar los reportes: {error}
        </p>
      )}

      {!cargando && !error && reporte && (
        <>
          <h3 style={estiloTitulo}>Reporte de préstamos</h3>

          <table style={estiloTabla}>
            <thead>
              <tr>
                <th style={estiloEncabezado}>Indicador</th>
                <th style={estiloEncabezado}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={estiloCelda}>Total de préstamos</td>
                <td style={estiloCelda}>{reporte.totalPrestamos}</td>
              </tr>
              <tr>
                <td style={estiloCelda}>Préstamos activos</td>
                <td style={estiloCelda}>{reporte.prestamosActivos}</td>
              </tr>
              <tr>
                <td style={estiloCelda}>Préstamos devueltos</td>
                <td style={estiloCelda}>{reporte.prestamosDevueltos}</td>
              </tr>
              <tr>
                <td style={estiloCelda}>Préstamos vencidos</td>
                <td style={estiloCelda}>{reporte.prestamosVencidos}</td>
              </tr>
            </tbody>
          </table>

          <h3 style={estiloTitulo}>Reporte de sanciones</h3>

          <table style={estiloTabla}>
            <thead>
              <tr>
                <th style={estiloEncabezado}>Indicador</th>
                <th style={estiloEncabezado}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={estiloCelda}>Total de sanciones</td>
                <td style={estiloCelda}>{reporte.totalSanciones}</td>
              </tr>
              <tr>
                <td style={estiloCelda}>Sanciones pendientes</td>
                <td style={estiloCelda}>{reporte.sancionesPendientes}</td>
              </tr>
              <tr>
                <td style={estiloCelda}>Sanciones pagadas</td>
                <td style={estiloCelda}>{reporte.sancionesPagadas}</td>
              </tr>
            </tbody>
          </table>

          <h3 style={estiloTitulo}>Reporte de inventario</h3>

          <table style={estiloTabla}>
            <thead>
              <tr>
                <th style={estiloEncabezado}>Indicador</th>
                <th style={estiloEncabezado}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={estiloCelda}>Total de ejemplares</td>
                <td style={estiloCelda}>{reporte.totalEjemplares}</td>
              </tr>
              <tr>
                <td style={estiloCelda}>Ejemplares disponibles</td>
                <td style={estiloCelda}>{reporte.ejemplaresDisponibles}</td>
              </tr>
              <tr>
                <td style={estiloCelda}>Ejemplares prestados</td>
                <td style={estiloCelda}>{reporte.ejemplaresPrestados}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
