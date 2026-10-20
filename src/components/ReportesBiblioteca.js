
"use client";

import { useEffect, useState } from "react";
import { generarReporteBiblioteca } from "@/services/reportesService";

import {
  ChartNoAxesColumnIncreasing,
  BookOpen,
  BookCheck,
  Clock3,
  AlertTriangle,
  ShieldAlert,
  CircleCheck,
  LibraryBig,
  BookCopy,
  RefreshCw
} from "lucide-react";

import styles from "./TablaLibros.module.css";

export default function ReportesBiblioteca({ actualizacion }) {
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [recargar, setRecargar] = useState(0);

  useEffect(() => {
    let activo = true;

    async function cargarReporte() {
      setCargando(true);
      setError("");

      try {
        const datos = await generarReporteBiblioteca();

        if (activo) {
          setReporte(datos);
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

    cargarReporte();

    return () => {
      activo = false;
    };
  }, [actualizacion, recargar]);

  return (
    <section className={styles.tarjeta}>

      {/* ENCABEZADO */}

      <div className={styles.encabezado}>
        <div className={styles.titulo}>
          <div className={styles.icono}>
            <ChartNoAxesColumnIncreasing size={25} />
          </div>

          <div>
            <h2>Reportes de la biblioteca</h2>
            <p>
              Consulta las estadísticas generales del sistema.
            </p>
          </div>
        </div>

        <button
          type="button"
          className={styles.botonActualizarReporte}
          onClick={() => setRecargar(recargar + 1)}
          disabled={cargando}
        >
          <RefreshCw size={17} />
          Actualizar
        </button>
      </div>

      {cargando && (
        <p className={styles.mensaje}>
          Cargando reportes...
        </p>
      )}

      {error && (
        <p className={styles.mensajeError}>
          Error al cargar los reportes: {error}
        </p>
      )}

      {!cargando && !error && reporte && (
        <div className={styles.contenidoReportes}>

          {/* PRÉSTAMOS */}

          <div className={styles.seccionReporte}>
            <div className={styles.tituloSeccionReporte}>
              <BookOpen size={20} />
              <h3>Reporte de préstamos</h3>
            </div>

            <div className={styles.cuadriculaReportes}>
              <div className={styles.tarjetaReporte}>
                <BookOpen size={21} />
                <span>Total de préstamos</span>
                <strong>{reporte.totalPrestamos ?? 0}</strong>
              </div>

              <div className={styles.tarjetaReporte}>
                <Clock3 size={21} />
                <span>Préstamos activos</span>
                <strong>{reporte.prestamosActivos ?? 0}</strong>
              </div>

              <div className={styles.tarjetaReporte}>
                <BookCheck size={21} />
                <span>Préstamos devueltos</span>
                <strong>{reporte.prestamosDevueltos ?? 0}</strong>
              </div>

              <div className={styles.tarjetaReporte}>
                <AlertTriangle size={21} />
                <span>Préstamos vencidos</span>
                <strong>{reporte.prestamosVencidos ?? 0}</strong>
              </div>
            </div>
          </div>

          {/* SANCIONES */}

          <div className={styles.seccionReporte}>
            <div className={styles.tituloSeccionReporte}>
              <ShieldAlert size={20} />
              <h3>Reporte de sanciones</h3>
            </div>

            <div className={styles.cuadriculaReportes}>
              <div className={styles.tarjetaReporte}>
                <ShieldAlert size={21} />
                <span>Total de sanciones</span>
                <strong>{reporte.totalSanciones ?? 0}</strong>
              </div>

              <div className={styles.tarjetaReporte}>
                <Clock3 size={21} />
                <span>Sanciones pendientes</span>
                <strong>{reporte.sancionesPendientes ?? 0}</strong>
              </div>

              <div className={styles.tarjetaReporte}>
                <CircleCheck size={21} />
                <span>Sanciones pagadas</span>
                <strong>{reporte.sancionesPagadas ?? 0}</strong>
              </div>
            </div>
          </div>

          {/* INVENTARIO */}

          <div className={styles.seccionReporte}>
            <div className={styles.tituloSeccionReporte}>
              <LibraryBig size={20} />
              <h3>Reporte de inventario</h3>
            </div>

            <div className={styles.cuadriculaReportes}>
              <div className={styles.tarjetaReporte}>
                <BookCopy size={21} />
                <span>Total de ejemplares</span>
                <strong>{reporte.totalEjemplares ?? 0}</strong>
              </div>

              <div className={styles.tarjetaReporte}>
                <CircleCheck size={21} />
                <span>Ejemplares disponibles</span>
                <strong>{reporte.ejemplaresDisponibles ?? 0}</strong>
              </div>

              <div className={styles.tarjetaReporte}>
                <BookOpen size={21} />
                <span>Ejemplares prestados</span>
                <strong>{reporte.ejemplaresPrestados ?? 0}</strong>
              </div>
            </div>
          </div>

        </div>
      )}

    </section>
  );
}
