
"use client";

import { useEffect, useState } from "react";
import {
  listarPrestamosActivos,
  registrarDevolucion
} from "@/services/prestamosService";

import {
  Handshake,
  Search,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  X,
  RotateCcw
} from "lucide-react";

import styles from "./TablaLibros.module.css";

const PRESTAMOS_POR_PAGINA = 10;

export default function TablaPrestamos({ actualizacion, alDevolver }) {
  const [prestamos, setPrestamos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [prestamoSeleccionado, setPrestamoSeleccionado] = useState(null);
  const [guardandoDevolucion, setGuardandoDevolucion] = useState(false);
  const [mensajeDevolucion, setMensajeDevolucion] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    let activo = true;

    async function cargarPrestamos() {
      setCargando(true);
      setError("");

      try {
        const datos = await listarPrestamosActivos();

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
  }, [actualizacion]);

  function mostrarFecha(fecha) {
    if (!fecha) return "Sin fecha";

    const partes = fecha.split("T")[0].split("-");

    if (partes.length !== 3) return fecha;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  // Buscar préstamos

  const prestamosFiltrados = prestamos.filter((prestamo) => {
    const texto = busqueda.toLowerCase().trim();

    return (
      String(prestamo.usuario || "").toLowerCase().includes(texto) ||
      String(prestamo.ejemplar || "").toLowerCase().includes(texto) ||
      String(prestamo.libro || "").toLowerCase().includes(texto)
    );
  });

  // Paginación

  const totalPaginas = Math.max(
    1,
    Math.ceil(prestamosFiltrados.length / PRESTAMOS_POR_PAGINA)
  );

  const paginaVisible = Math.min(paginaActual, totalPaginas);

  const prestamosPagina = prestamosFiltrados.slice(
    (paginaVisible - 1) * PRESTAMOS_POR_PAGINA,
    paginaVisible * PRESTAMOS_POR_PAGINA
  );

  function cambiarBusqueda(valor) {
    setBusqueda(valor);
    setPaginaActual(1);
  }

  function cancelarDevolucion() {
    if (guardandoDevolucion) return;

    setPrestamoSeleccionado(null);
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

      const datos = await listarPrestamosActivos();
      setPrestamos(datos || []);

    } catch (error) {
      setMensajeDevolucion("Error: " + error.message);
      setPrestamoSeleccionado(null);
    } finally {
      setGuardandoDevolucion(false);
    }
  }

  return (
    <section className={styles.tarjeta}>

      {/* ENCABEZADO */}

      <div className={styles.encabezado}>
        <div className={styles.titulo}>
          <div className={styles.icono}>
            <Handshake size={25} />
          </div>

          <div>
            <h2>Préstamos activos</h2>
            <p>
              Consulta los préstamos y registra las devoluciones.
            </p>
          </div>
        </div>

        <span className={styles.total}>
          {prestamos.length} préstamos
        </span>
      </div>

      {/* BUSCADOR */}

      <div className={styles.buscador}>
        <Search size={20} />

        <input
          type="search"
          aria-label="Buscar préstamos"
          placeholder="Buscar por usuario, ejemplar o libro..."
          value={busqueda}
          onChange={(e) => cambiarBusqueda(e.target.value)}
        />
      </div>

      {mensajeDevolucion && (
        <p
          role="status"
          className={
            mensajeDevolucion.startsWith("Error")
              ? styles.mensajeError
              : styles.mensajeExito
          }
        >
          {mensajeDevolucion}
        </p>
      )}

      {cargando && (
        <p className={styles.mensaje}>Cargando préstamos...</p>
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
                ? "No hay préstamos activos."
                : "No se encontraron préstamos con esa búsqueda."}
            </p>
          ) : (
            <>
              <div className={styles.tablaContenedor}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Ejemplar</th>
                      <th>Libro</th>
                      <th>Préstamo</th>
                      <th>Vencimiento</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {prestamosPagina.map((prestamo) => (
                      <tr key={prestamo.id_prestamo}>
                        <td>{prestamo.usuario}</td>
                        <td>{prestamo.ejemplar}</td>

                        <td className={styles.nombreLibro}>
                          {prestamo.libro}
                        </td>

                        <td>
                          {mostrarFecha(prestamo.fecha_prestamo)}
                        </td>

                        <td>
                          {mostrarFecha(prestamo.fecha_vencimiento)}
                        </td>

                        <td>
                          <span className={styles.estadoPrestamo}>
                            <CircleCheck size={15} />
                            {prestamo.estado}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className={styles.botonDevolucion}
                            onClick={() =>
                              setPrestamoSeleccionado(prestamo)
                            }
                          >
                            <RotateCcw size={16} />
                            Registrar devolución
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPaginas > 1 && (
                <nav
                  className={styles.paginacion}
                  aria-label="Paginación de préstamos"
                >
                  <button
                    type="button"
                    disabled={paginaVisible === 1}
                    onClick={() =>
                      setPaginaActual(paginaVisible - 1)
                    }
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
                    onClick={() =>
                      setPaginaActual(paginaVisible + 1)
                    }
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

      {/* CONFIRMAR DEVOLUCIÓN */}

      {prestamoSeleccionado && (
        <div className={styles.fondoModal}>
          <div
            className={styles.modal}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="tituloConfirmarDevolucion"
            aria-describedby="descripcionConfirmarDevolucion"
          >
            <div className={styles.encabezadoModal}>
              <div className={styles.icono}>
                <CalendarCheck2 size={27} />
              </div>

              <button
                type="button"
                className={styles.cerrar}
                onClick={cancelarDevolucion}
                disabled={guardandoDevolucion}
                aria-label="Cerrar ventana"
              >
                <X size={20} />
              </button>
            </div>

            <h3 id="tituloConfirmarDevolucion">
              Confirmar devolución
            </h3>

            <p id="descripcionConfirmarDevolucion">
              ¿Deseas registrar la devolución de este préstamo?
            </p>

            <div className={styles.detallesDevolucion}>
              <p>
                <strong>Usuario:</strong>{" "}
                {prestamoSeleccionado.usuario}
              </p>

              <p>
                <strong>Ejemplar:</strong>{" "}
                {prestamoSeleccionado.ejemplar}
              </p>

              <p>
                <strong>Libro:</strong>{" "}
                {prestamoSeleccionado.libro}
              </p>

              <p>
                <strong>Vencimiento:</strong>{" "}
                {mostrarFecha(prestamoSeleccionado.fecha_vencimiento)}
              </p>
            </div>

            <p className={styles.avisoDevolucion}>
              El ejemplar volverá a estar disponible. Si existe
              retraso, el sistema aplicará las sanciones
              correspondientes según las reglas configuradas.
            </p>

            <div className={styles.accionesModal}>
              <button
                type="button"
                className={styles.cancelar}
                disabled={guardandoDevolucion}
                onClick={cancelarDevolucion}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.confirmarReactivar}
                disabled={guardandoDevolucion}
                onClick={confirmarDevolucion}
              >
                <CircleCheck size={17} />

                {guardandoDevolucion
                  ? "Registrando..."
                  : "Sí, registrar devolución"}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
