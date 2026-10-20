
"use client";

import { useEffect, useState } from "react";
import {
  listarEjemplares,
  cambiarEstadoEjemplar
} from "@/services/ejemplaresService";

import {
  BookCopy,
  Search,
  ListFilter,
  CheckCircle2,
  Clock3,
  CircleX,
  Ban,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  TriangleAlert,
  X
} from "lucide-react";

import styles from "./TablaLibros.module.css";

const EJEMPLARES_POR_PAGINA = 10;

export default function TablaEjemplares({
  actualizacion,
  alCambiarEstado
}) {
  const [ejemplares, setEjemplares] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  const [ejemplarSeleccionado, setEjemplarSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarEjemplares() {
      setCargando(true);
      setError("");

      try {
        const datos = await listarEjemplares();

        if (activo) {
          setEjemplares(datos || []);
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

    cargarEjemplares();

    return () => {
      activo = false;
    };
  }, [actualizacion]);

  // Obtener categorías

  const categorias = [
    ...new Set(
      ejemplares
        .map((ejemplar) => ejemplar.categoria)
        .filter(Boolean)
    )
  ].sort((a, b) => a.localeCompare(b, "es"));

  // Filtrar ejemplares

  const ejemplaresFiltrados = ejemplares.filter((ejemplar) => {
    const texto = busqueda.toLowerCase().trim();

    const coincideBusqueda =
      String(ejemplar.codigo || "").toLowerCase().includes(texto) ||
      String(ejemplar.isbn || "").toLowerCase().includes(texto) ||
      String(ejemplar.titulo || "").toLowerCase().includes(texto);

    const coincideCategoria =
      categoriaSeleccionada === "" ||
      ejemplar.categoria === categoriaSeleccionada;

    return coincideBusqueda && coincideCategoria;
  });

  // Paginación

  const totalPaginas = Math.max(
    1,
    Math.ceil(ejemplaresFiltrados.length / EJEMPLARES_POR_PAGINA)
  );

  const paginaVisible = Math.min(paginaActual, totalPaginas);

  const ejemplaresPagina = ejemplaresFiltrados.slice(
    (paginaVisible - 1) * EJEMPLARES_POR_PAGINA,
    paginaVisible * EJEMPLARES_POR_PAGINA
  );

  function cambiarBusqueda(valor) {
    setBusqueda(valor);
    setPaginaActual(1);
  }

  function cambiarCategoria(valor) {
    setCategoriaSeleccionada(valor);
    setPaginaActual(1);
  }

  // Cambiar estado

  function abrirConfirmacion(ejemplar) {
    setMensaje("");
    setEjemplarSeleccionado(ejemplar);
  }

  function cancelarCambio() {
    if (guardando) return;
    setEjemplarSeleccionado(null);
  }

  async function confirmarCambio() {
    if (!ejemplarSeleccionado || guardando) return;

    const ejemplar = ejemplarSeleccionado;

    // Solo permitir baja o reactivación
    if (
      ejemplar.estado !== "disponible" &&
      ejemplar.estado !== "baja"
    ) {
      setEjemplarSeleccionado(null);
      return;
    }

    const nuevoEstado =
      ejemplar.estado === "disponible" ? "baja" : "disponible";

    setGuardando(true);
    setMensaje("");

    try {
      await cambiarEstadoEjemplar(ejemplar.id_ejemplar, nuevoEstado);

      if (alCambiarEstado) {
        alCambiarEstado();
      }

      const datos = await listarEjemplares();
      setEjemplares(datos || []);

      setEjemplarSeleccionado(null);

      setMensaje(
        nuevoEstado === "baja"
          ? "Ejemplar dado de baja correctamente."
          : "Ejemplar reactivado correctamente."
      );
    } catch (error) {
      setMensaje("Error: " + error.message);
      setEjemplarSeleccionado(null);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className={styles.tarjeta}>

      {/* ENCABEZADO */}

      <div className={styles.encabezado}>
        <div className={styles.titulo}>
          <div className={styles.icono}>
            <BookCopy size={25} />
          </div>

          <div>
            <h2>Gestión de ejemplares</h2>
            <p>Consulta y administra las copias físicas.</p>
          </div>
        </div>

        <span className={styles.total}>
          {ejemplares.length} ejemplares
        </span>
      </div>

      {/* BUSCADOR */}

      <div className={styles.buscador}>
        <Search size={20} />

        <input
          type="search"
          aria-label="Buscar ejemplares"
          placeholder="Buscar por código, ISBN o título..."
          value={busqueda}
          onChange={(e) => cambiarBusqueda(e.target.value)}
        />
      </div>

      {/* FILTRO */}

      <div className={styles.filtroEjemplares}>
        <ListFilter size={19} />

        <select
          aria-label="Filtrar ejemplares por categoría"
          value={categoriaSeleccionada}
          onChange={(e) => cambiarCategoria(e.target.value)}
        >
          <option value="">Todas las categorías</option>

          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      {/* MENSAJES */}

      {mensaje && (
        <p
          role="status"
          className={
            mensaje.startsWith("Error")
              ? styles.mensajeError
              : styles.mensajeExito
          }
        >
          {mensaje}
        </p>
      )}

      {cargando && (
        <p className={styles.mensaje}>Cargando ejemplares...</p>
      )}

      {error && (
        <p className={styles.mensajeError}>
          Error: {error}
        </p>
      )}

      {!cargando && !error && (
        <>
          <p className={styles.contador}>
            {ejemplaresFiltrados.length} resultados encontrados
          </p>

          {ejemplaresFiltrados.length === 0 ? (
            <p className={styles.mensaje}>
              No se encontraron ejemplares.
            </p>
          ) : (
            <>
              {/* TABLA */}

              <div className={styles.tablaContenedor}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>ISBN</th>
                      <th>Libro</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {ejemplaresPagina.map((ejemplar) => (
                      <tr key={ejemplar.id_ejemplar}>
                        <td>{ejemplar.codigo}</td>

                        <td>{ejemplar.isbn}</td>

                        <td className={styles.nombreLibro}>
                          {ejemplar.titulo}
                        </td>

                        <td>
                          <span
                            className={
                              ejemplar.estado === "disponible"
                                ? styles.estadoDisponible
                                : ejemplar.estado === "prestado"
                                  ? styles.estadoPrestado
                                  : styles.estadoBaja
                            }
                          >
                            {ejemplar.estado === "disponible" ? (
                              <CheckCircle2 size={16} />
                            ) : ejemplar.estado === "prestado" ? (
                              <Clock3 size={16} />
                            ) : (
                              <CircleX size={16} />
                            )}

                            {ejemplar.estado === "disponible"
                              ? "Disponible"
                              : ejemplar.estado === "prestado"
                                ? "Prestado"
                                : ejemplar.estado === "baja"
                                  ? "De baja"
                                  : ejemplar.estado}
                          </span>
                        </td>

                        <td>
                          {ejemplar.estado === "prestado" ? (
                            <span className={styles.sinAcciones}>
                              Sin acciones
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={
                                guardando ||
                                (ejemplar.estado !== "disponible" &&
                                  ejemplar.estado !== "baja")
                              }
                              onClick={() => abrirConfirmacion(ejemplar)}
                              className={
                                ejemplar.estado === "disponible"
                                  ? styles.botonBaja
                                  : styles.botonReactivar
                              }
                            >
                              {ejemplar.estado === "disponible" ? (
                                <Ban size={16} />
                              ) : (
                                <RotateCcw size={16} />
                              )}

                              {ejemplar.estado === "disponible"
                                ? "Dar de baja"
                                : "Reactivar"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINACIÓN */}

              {totalPaginas > 1 && (
                <nav
                  className={styles.paginacion}
                  aria-label="Paginación de ejemplares"
                >
                  <button
                    type="button"
                    disabled={paginaVisible === 1}
                    onClick={() => setPaginaActual(paginaVisible - 1)}
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
                    onClick={() => setPaginaActual(paginaVisible + 1)}
                  >
                    Siguiente
                    <ChevronRight size={17} />
                  </button>
                </nav>
              )}
            </>
          )}
        </>
      )}

      {/* CONFIRMACIÓN */}

      {ejemplarSeleccionado && (
        <div className={styles.fondoModal}>
          <div
            className={styles.modal}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="tituloConfirmacionEjemplar"
            aria-describedby="descripcionConfirmacionEjemplar"
          >
            <div className={styles.encabezadoModal}>
              <div className={styles.iconoAdvertencia}>
                <TriangleAlert size={27} />
              </div>

              <button
                type="button"
                className={styles.cerrar}
                onClick={cancelarCambio}
                disabled={guardando}
                aria-label="Cerrar ventana"
              >
                <X size={20} />
              </button>
            </div>

            <h3 id="tituloConfirmacionEjemplar">
              {ejemplarSeleccionado.estado === "disponible"
                ? "Confirmar baja de ejemplar"
                : "Confirmar reactivación"}
            </h3>

            <p id="descripcionConfirmacionEjemplar">
              {ejemplarSeleccionado.estado === "disponible"
                ? "¿Deseas dar de baja este ejemplar?"
                : "¿Deseas reactivar este ejemplar?"}
            </p>

            <strong className={styles.libroEliminar}>
              {ejemplarSeleccionado.codigo}
              {" — "}
              {ejemplarSeleccionado.titulo}
            </strong>

            <p className={styles.advertencia}>
              {ejemplarSeleccionado.estado === "disponible"
                ? "El ejemplar dejará de estar disponible para préstamos."
                : "El ejemplar volverá a estar disponible para préstamos."}
            </p>

            <div className={styles.accionesModal}>
              <button
                type="button"
                className={styles.cancelar}
                onClick={cancelarCambio}
                disabled={guardando}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={
                  ejemplarSeleccionado.estado === "disponible"
                    ? styles.confirmar
                    : styles.confirmarReactivar
                }
                onClick={confirmarCambio}
                disabled={guardando}
              >
                {guardando
                  ? "Guardando..."
                  : ejemplarSeleccionado.estado === "disponible"
                    ? "Sí, dar de baja"
                    : "Sí, reactivar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
