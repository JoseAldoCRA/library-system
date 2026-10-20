
"use client";

import { useEffect, useState } from "react";
import { listarMisPrestamos } from "@/services/prestamosService";

import {
  BookOpenCheck,
  Search,
  Clock3,
  CircleCheck,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import styles from "./TablaLibros.module.css";

export default function TablaMisPrestamos() {
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    let activo = true;

    async function cargarPrestamos() {
      setCargando(true);
      setError("");

      try {
        const datos = await listarMisPrestamos();

        if (activo) {
          setPrestamos(datos || []);
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
  }, []);

  function mostrarFecha(fecha) {
    if (!fecha) return "—";

    const partes = fecha.split("T")[0].split("-");

    if (partes.length !== 3) return fecha;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function estaVencido(prestamo) {
    if (
      prestamo.estado !== "Activo" ||
      !prestamo.fecha_vencimiento
    ) {
      return false;
    }

    const hoy = new Date();

    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, "0");
    const dia = String(hoy.getDate()).padStart(2, "0");

    const fechaHoy = `${anio}-${mes}-${dia}`;

    return (
      prestamo.fecha_vencimiento.split("T")[0] < fechaHoy
    );
  }

  // Indicadores

  const totalPrestamos = prestamos.length;

  const prestamosActivos = prestamos.filter(
    (item) => item.estado === "Activo"
  ).length;

  const prestamosDevueltos = prestamos.filter(
    (item) => item.estado === "Devuelto"
  ).length;

  // Buscador y filtros

  const prestamosFiltrados = prestamos.filter((item) => {
    const texto = busqueda.toLowerCase().trim();

    const coincideBusqueda =
      String(item.libro || "").toLowerCase().includes(texto) ||
      String(item.ejemplar || "").toLowerCase().includes(texto);

    const coincideFiltro =
      filtro === "todos" ||
      (filtro === "activos" && item.estado === "Activo") ||
      (filtro === "devueltos" && item.estado === "Devuelto");

    return coincideBusqueda && coincideFiltro;
  });

  // Paginación

  const totalPaginas = Math.max(
    1,
    Math.ceil(prestamosFiltrados.length / 10)
  );

  const paginaVisible = Math.min(pagina, totalPaginas);

  const prestamosPagina = prestamosFiltrados.slice(
    (paginaVisible - 1) * 10,
    paginaVisible * 10
  );

  return (
    <section className={styles.tarjeta}>

      {/* ENCABEZADO */}

      <div className={styles.encabezado}>
        <div className={styles.titulo}>
          <div className={styles.icono}>
            <BookOpenCheck size={25} />
          </div>

          <div>
            <h2>Mis préstamos</h2>
            <p>
              Consulta tus préstamos y fechas de vencimiento.
            </p>
          </div>
        </div>

        <span className={styles.total}>
          {totalPrestamos} préstamos
        </span>
      </div>

      {/* INDICADORES */}

      <div className={styles.resumenMisPrestamos}>
        <div className={styles.indicadorMiPrestamo}>
          <BookOpenCheck size={20} />
          <span>Total de préstamos</span>
          <strong>{totalPrestamos}</strong>
        </div>

        <div className={styles.indicadorMiPrestamo}>
          <Clock3 size={20} />
          <span>Activos</span>
          <strong>{prestamosActivos}</strong>
        </div>

        <div className={styles.indicadorMiPrestamo}>
          <CircleCheck size={20} />
          <span>Devueltos</span>
          <strong>{prestamosDevueltos}</strong>
        </div>
      </div>

      {/* BUSCADOR */}

      <div className={styles.buscador}>
        <Search size={20} />

        <input
          type="search"
          aria-label="Buscar mis préstamos"
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
        <label htmlFor="filtroMisPrestamos">
          Mostrar
        </label>

        <select
          id="filtroMisPrestamos"
          value={filtro}
          onChange={(evento) => {
            setFiltro(evento.target.value);
            setPagina(1);
          }}
        >
          <option value="todos">Todos los préstamos</option>
          <option value="activos">Activos</option>
          <option value="devueltos">Devueltos</option>
        </select>
      </div>

      {cargando && (
        <p className={styles.mensaje}>
          Cargando tus préstamos...
        </p>
      )}

      {error && (
        <p className={styles.mensajeError}>
          Error: {error}
        </p>
      )}

      {!cargando && !error && (
        <>
          <p className={styles.contador}>
            {prestamosFiltrados.length} resultados encontrados
          </p>

          {prestamosFiltrados.length === 0 ? (
            <p className={styles.mensaje}>
              {prestamos.length === 0
                ? "No tienes préstamos registrados."
                : "No se encontraron préstamos."}
            </p>
          ) : (
            <>
              <div className={styles.tablaContenedor}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Libro</th>
                      <th>Ejemplar</th>
                      <th>Préstamo</th>
                      <th>Vencimiento</th>
                      <th>Devolución</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {prestamosPagina.map((prestamo) => (
                      <tr key={prestamo.id_prestamo}>
                        <td className={styles.nombreLibro}>
                          {prestamo.libro}
                        </td>

                        <td>{prestamo.ejemplar}</td>

                        <td>
                          {mostrarFecha(prestamo.fecha_prestamo)}
                        </td>

                        <td>
                          {mostrarFecha(prestamo.fecha_vencimiento)}
                        </td>

                        <td>
                          {mostrarFecha(prestamo.fecha_devolucion)}
                        </td>

                        <td>
                          <span
                            className={
                              prestamo.estado === "Devuelto"
                                ? styles.estadoDevuelto
                                : estaVencido(prestamo)
                                  ? styles.estadoConRetraso
                                  : styles.estadoPrestamo
                            }
                          >
                            {prestamo.estado === "Devuelto"
                              ? "Devuelto"
                              : estaVencido(prestamo)
                                ? "Vencido"
                                : "Activo"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
