
"use client";

import { useEffect, useState } from "react";

import {
  obtenerMisSolicitudes,
  cancelarSolicitudPrestamo,
} from "@/repositories/solicitudesRepository";

import {
  ClipboardList,
  Clock3,
  CircleCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from "lucide-react";

import styles from "./TablaLibros.module.css";

export default function TablaMisSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [pagina, setPagina] = useState(1);

  const [cancelando, setCancelando] = useState(null);
  const [solicitudCancelar, setSolicitudCancelar] = useState(null);

  useEffect(() => {
    let activo = true;

    async function cargarSolicitudes() {
      try {
        const datos = await obtenerMisSolicitudes();

        if (activo) {
          setSolicitudes(datos || []);
        }
      } catch (err) {
        if (activo) setError(err.message);
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarSolicitudes();

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

  async function confirmarCancelacion() {
    if (!solicitudCancelar || cancelando !== null) return;

    const id = solicitudCancelar.id_solicitud;

    setCancelando(id);
    setError("");
    setMensaje("");

    try {
      await cancelarSolicitudPrestamo(id);

      setSolicitudes((actuales) =>
        actuales.map((item) =>
          item.id_solicitud === id
            ? { ...item, estado: "cancelada" }
            : item
        )
      );

      setMensaje("La solicitud se canceló correctamente.");
      setSolicitudCancelar(null);
    } catch (err) {
      setError(err.message || "No se pudo cancelar la solicitud.");
    } finally {
      setCancelando(null);
    }
  }

  const totalSolicitudes = solicitudes.length;

  const pendientes = solicitudes.filter(
    (item) => item.estado === "pendiente"
  ).length;

  const finalizadas = solicitudes.filter(
    (item) => item.estado !== "pendiente"
  ).length;

  const solicitudesFiltradas = solicitudes.filter((item) => {
    const texto = busqueda.toLowerCase().trim();

    const coincideBusqueda =
      String(item.libros?.titulo || "")
        .toLowerCase()
        .includes(texto) ||
      String(item.libros?.autor || "")
        .toLowerCase()
        .includes(texto) ||
      String(item.libros?.isbn || "")
        .toLowerCase()
        .includes(texto);

    const coincideFiltro =
      filtro === "todos" || item.estado === filtro;

    return coincideBusqueda && coincideFiltro;
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(solicitudesFiltradas.length / 10)
  );

  const paginaVisible = Math.min(pagina, totalPaginas);

  const solicitudesPagina = solicitudesFiltradas.slice(
    (paginaVisible - 1) * 10,
    paginaVisible * 10
  );

  function textoEstado(estado) {
    if (estado === "pendiente") return "Pendiente";
    if (estado === "aprobada") return "Aprobada";
    if (estado === "rechazada") return "Rechazada";
    if (estado === "cancelada") return "Cancelada";
    return estado;
  }

  function estiloEstado(estado) {
    if (estado === "pendiente") return styles.estadoPrestado;
    if (estado === "aprobada") return styles.estadoPrestamo;
    if (estado === "rechazada") return styles.estadoRechazadoSolicitud;
    return styles.estadoBaja;
  }

  return (
    <section className={styles.tarjeta}>
      {/* ENCABEZADO */}

      <div className={styles.encabezado}>
        <div className={styles.titulo}>
          <div className={styles.icono}>
            <ClipboardList size={25} />
          </div>

          <div>
            <h2>Mis solicitudes</h2>
            <p>
              Consulta el estado de tus solicitudes de préstamo.
            </p>
          </div>
        </div>

        <span className={styles.total}>
          {totalSolicitudes} solicitudes
        </span>
      </div>

      {/* INDICADORES */}

      <div className={styles.resumenMisPrestamos}>
        <div className={styles.indicadorMiPrestamo}>
          <ClipboardList size={20} />
          <span>Total de solicitudes</span>
          <strong>{totalSolicitudes}</strong>
        </div>

        <div className={styles.indicadorMiPrestamo}>
          <Clock3 size={20} />
          <span>Pendientes</span>
          <strong>{pendientes}</strong>
        </div>

        <div className={styles.indicadorMiPrestamo}>
          <CircleCheck size={20} />
          <span>Finalizadas</span>
          <strong>{finalizadas}</strong>
        </div>
      </div>

      {/* BUSCADOR */}

      <div className={styles.buscador}>
        <Search size={20} />

        <input
          type="search"
          aria-label="Buscar mis solicitudes"
          placeholder="Buscar por título, autor o ISBN..."
          value={busqueda}
          onChange={(evento) => {
            setBusqueda(evento.target.value);
            setPagina(1);
          }}
        />
      </div>

      {/* FILTROS */}

      <div className={styles.filtrosSanciones}>
        <label htmlFor="filtroMisSolicitudes">
          Mostrar
        </label>

        <select
          id="filtroMisSolicitudes"
          value={filtro}
          onChange={(evento) => {
            setFiltro(evento.target.value);
            setPagina(1);
          }}
        >
          <option value="todos">Todas las solicitudes</option>
          <option value="pendiente">Pendientes</option>
          <option value="aprobada">Aprobadas</option>
          <option value="rechazada">Rechazadas</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>

      {/* MENSAJES */}

      {cargando && (
        <p className={styles.mensaje}>
          Cargando tus solicitudes...
        </p>
      )}

      {error && (
        <p className={styles.mensajeError} role="alert">
          Error: {error}
        </p>
      )}

      {mensaje && (
        <p className={styles.mensajeExito} role="status">
          {mensaje}
        </p>
      )}

      {/* TABLA */}

      {!cargando && (
        <>
          <p className={styles.contador}>
            {solicitudesFiltradas.length} resultados encontrados
          </p>

          {solicitudesFiltradas.length === 0 ? (
            <p className={styles.mensaje}>
              {solicitudes.length === 0
                ? "Todavía no tienes solicitudes registradas."
                : "No se encontraron solicitudes."}
            </p>
          ) : (
            <>
              <div className={styles.tablaContenedor}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Libro</th>
                      <th>Autor</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {solicitudesPagina.map((solicitud) => (
                      <tr key={solicitud.id_solicitud}>
                        <td className={styles.nombreLibro}>
                          {solicitud.libros?.titulo || "Sin título"}
                        </td>

                        <td>
                          {solicitud.libros?.autor || "—"}
                        </td>

                        <td>
                          {mostrarFecha(solicitud.fecha_solicitud)}
                        </td>

                        <td>
                          <span className={estiloEstado(solicitud.estado)}>
                            {textoEstado(solicitud.estado)}
                          </span>
                        </td>

                        <td>
                          {solicitud.estado === "pendiente" ? (
                            <button
                              type="button"
                              className={styles.botonCancelarSolicitud}
                              onClick={() =>
                                setSolicitudCancelar(solicitud)
                              }
                              disabled={cancelando !== null}
                            >
                              <XCircle size={15} />
                              Cancelar
                            </button>
                          ) : (
                            <span className={styles.sinAcciones}>
                              Sin acciones
                            </span>
                          )}
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

      {/* CONFIRMACIÓN PARA CANCELAR */}

      {solicitudCancelar && (
        <div
          className={styles.fondoModal}
          role="presentation"
          onMouseDown={(evento) => {
            if (
              evento.target === evento.currentTarget &&
              cancelando === null
            ) {
              setSolicitudCancelar(null);
            }
          }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloCancelarSolicitud"
          >
            <div className={styles.encabezadoModal}>
              <div className={styles.iconoAdvertencia}>
                <XCircle size={27} />
              </div>
            </div>

            <h3 id="tituloCancelarSolicitud">
              ¿Cancelar solicitud?
            </h3>

            <p>
              Estás a punto de cancelar la solicitud de:
            </p>

            <strong className={styles.libroEliminar}>
              {solicitudCancelar.libros?.titulo}
            </strong>

            <p className={styles.advertencia}>
              La solicitud quedará registrada como cancelada.
              Si vuelves a necesitar este libro, podrás crear
              una nueva solicitud.
            </p>

            <div className={styles.accionesModal}>
              <button
                type="button"
                className={styles.cancelar}
                onClick={() => setSolicitudCancelar(null)}
                disabled={cancelando !== null}
              >
                Volver
              </button>

              <button
                type="button"
                className={styles.confirmar}
                onClick={confirmarCancelacion}
                disabled={cancelando !== null}
              >
                {cancelando !== null
                  ? "Cancelando..."
                  : "Sí, cancelar solicitud"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
