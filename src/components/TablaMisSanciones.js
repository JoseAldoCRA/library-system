
"use client";

import { useEffect, useState } from "react";
import { listarMisSanciones } from "@/services/sancionesService";

import {
  ShieldAlert,
  Clock3,
  CircleCheck,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import styles from "./TablaLibros.module.css";

export default function TablaMisSanciones() {
  const [sanciones, setSanciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    let activo = true;

    async function cargarSanciones() {
      setCargando(true);
      setError("");

      try {
        const datos = await listarMisSanciones();

        if (activo) {
          setSanciones(datos || []);
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
    if (!fecha) return "—";

    const partes = fecha.split("T")[0].split("-");

    if (partes.length !== 3) return fecha;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function mostrarMonto(monto) {
    return `$${Number(monto).toFixed(2)} MXN`;
  }

  // Indicadores

  const totalSanciones = sanciones.length;

  const sancionesPendientes = sanciones.filter(
    (item) => item.estado_pago === "pendiente"
  ).length;

  const sancionesPagadas = sanciones.filter(
    (item) => item.estado_pago === "pagado"
  ).length;

  // Búsqueda y filtros

  const sancionesFiltradas = sanciones.filter((item) => {
    const texto = busqueda.toLowerCase().trim();

    const coincideBusqueda =
      String(item.libro || "").toLowerCase().includes(texto) ||
      String(item.ejemplar || "").toLowerCase().includes(texto);

    const coincideEstado =
      filtro === "todos" ||
      item.estado_pago === filtro;

    return coincideBusqueda && coincideEstado;
  });

  // Paginación

  const totalPaginas = Math.max(
    1,
    Math.ceil(sancionesFiltradas.length / 10)
  );

  const paginaVisible = Math.min(pagina, totalPaginas);

  const sancionesPagina = sancionesFiltradas.slice(
    (paginaVisible - 1) * 10,
    paginaVisible * 10
  );

  return (
    <section className={styles.tarjeta}>

      {/* ENCABEZADO */}

      <div className={styles.encabezado}>
        <div className={styles.titulo}>
          <div className={styles.icono}>
            <ShieldAlert size={25} />
          </div>

          <div>
            <h2>Mis sanciones</h2>
            <p>
              Consulta las multas relacionadas con tus préstamos.
            </p>
          </div>
        </div>

        <span className={styles.total}>
          {totalSanciones} sanciones
        </span>
      </div>

      {/* RESUMEN */}

      <div className={styles.resumenSanciones}>

        <div className={styles.indicadorSancion}>
          <ShieldAlert size={20} />
          <div>
            <span>Total de sanciones</span>
            <strong>{totalSanciones}</strong>
          </div>
        </div>

        <div className={styles.indicadorSancion}>
          <Clock3 size={20} />
          <div>
            <span>Pendientes</span>
            <strong>{sancionesPendientes}</strong>
          </div>
        </div>

        <div className={styles.indicadorSancion}>
          <CircleCheck size={20} />
          <div>
            <span>Pagadas</span>
            <strong>{sancionesPagadas}</strong>
          </div>
        </div>

      </div>

      {/* BUSCADOR */}

      <div className={styles.buscador}>
        <Search size={20} />

        <input
          type="search"
          aria-label="Buscar mis sanciones"
          placeholder="Buscar por libro o ejemplar..."
          value={busqueda}
          onChange={(evento) => {
            setBusqueda(evento.target.value);
            setPagina(1);
          }}
        />
      </div>

      {/* FILTRO */}

      <div className={styles.filtrosSanciones}>
        <label htmlFor="filtroMisSanciones">
          Estado de pago
        </label>

        <select
          id="filtroMisSanciones"
          value={filtro}
          onChange={(evento) => {
            setFiltro(evento.target.value);
            setPagina(1);
          }}
        >
          <option value="todos">Todas las sanciones</option>
          <option value="pendiente">Pendientes</option>
          <option value="pagado">Pagadas</option>
        </select>
      </div>

      {/* MENSAJES */}

      {cargando && (
        <p className={styles.mensaje}>
          Cargando tus sanciones...
        </p>
      )}

      {error && (
        <p role="alert" className={styles.mensajeError}>
          Error: {error}
        </p>
      )}

      {/* TABLA */}

      {!cargando && !error && (
        <>
          <p className={styles.contador}>
            {sancionesFiltradas.length} resultados encontrados
          </p>

          {sancionesFiltradas.length === 0 ? (
            <p className={styles.mensaje}>
              {sanciones.length === 0
                ? "No tienes sanciones registradas."
                : "No se encontraron sanciones."}
            </p>
          ) : (
            <>
              <div className={styles.tablaContenedor}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Libro</th>
                      <th>Ejemplar</th>
                      <th>Vencimiento</th>
                      <th>Días de retraso</th>
                      <th>Monto</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sancionesPagina.map((sancion) => (
                      <tr key={sancion.id_sancion}>
                        <td className={styles.nombreLibro}>
                          {sancion.libro}
                        </td>

                        <td>{sancion.ejemplar}</td>

                        <td>
                          {mostrarFecha(sancion.fecha_vencimiento)}
                        </td>

                        <td>{sancion.dias_retraso}</td>

                        <td className={styles.montoSancion}>
                          {mostrarMonto(sancion.monto)}
                        </td>

                        <td>
                          <span
                            className={
                              sancion.estado_pago === "pagado"
                                ? styles.sancionPagada
                                : styles.sancionPendiente
                            }
                          >
                            {sancion.estado_pago === "pagado"
                              ? "Pagado"
                              : sancion.estado_pago === "pendiente"
                                ? "Pendiente"
                                : sancion.estado_pago}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINACIÓN */}

              {totalPaginas > 1 && (
                <div className={styles.paginacion}>
                  <button
                    type="button"
                    disabled={paginaVisible === 1}
                    onClick={() => setPagina(paginaVisible - 1)}
                  >
                    <ChevronLeft size={17} />
                    Anterior
                  </button>

                  <span>
                    Página {paginaVisible} de {totalPaginas}
                  </span>

                  <button
                    type="button"
                    disabled={paginaVisible === totalPaginas}
                    onClick={() => setPagina(paginaVisible + 1)}
                  >
                    Siguiente
                    <ChevronRight size={17} />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

    </section>
  );
}
