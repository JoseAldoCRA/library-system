"use client";

import { useEffect, useState } from "react";
import {
  obtenerTodasSolicitudes,
  rechazarSolicitudPrestamo,
  aprobarSolicitudPrestamo,
} from "@/repositories/solicitudesRepository";
import { crearClienteSupabase } from "@/lib/supabaseClient";


import {
  ClipboardList,
  Clock3,
  CircleCheck,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CalendarDays
} from "lucide-react";

import styles from "./TablaLibros.module.css";

export default function TablaSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [solicitudRechazar, setSolicitudRechazar] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [solicitudAprobar, setSolicitudAprobar] = useState(null);
  const [ejemplarSeleccionado, setEjemplarSeleccionado] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [ejemplaresDisponibles, setEjemplaresDisponibles] = useState([]);
  const [cargandoEjemplares, setCargandoEjemplares] = useState(false);


  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("pendiente");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    let activo = true;

    async function cargarSolicitudes() {
      try {
        const datos = await obtenerTodasSolicitudes();

        if (activo) {
          setSolicitudes(datos);
        }
      } catch (err) {
        if (activo) {
          setError(err.message);
        }
      } finally {
        if (activo) setCargando(false);
      }
    }

    cargarSolicitudes();

    return () => {
      activo = false;
    };
  }, []);


  async function confirmarRechazo() {
    if (!solicitudRechazar || procesando) return;

    setProcesando(true);
    setError("");
    setMensaje("");

    try {
      await rechazarSolicitudPrestamo(
        solicitudRechazar.id_solicitud
      );

      setSolicitudes((actuales) =>
        actuales.map((solicitud) =>
          solicitud.id_solicitud === solicitudRechazar.id_solicitud
            ? { ...solicitud, estado: "rechazada" }
            : solicitud
        )
      );

      setMensaje("La solicitud se rechazó correctamente.");
      setSolicitudRechazar(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }



  async function abrirAprobacion(solicitud) {
    setError("");
    setMensaje("");
    setEjemplarSeleccionado("");
    setFechaVencimiento("");
    setEjemplaresDisponibles([]);
    setCargandoEjemplares(true);
    setSolicitudAprobar(solicitud);

    try {
      const supabase = crearClienteSupabase();

      const { data, error } = await supabase
        .from("ejemplares")
        .select("id_ejemplar, codigo, estado")
        .eq("id_libro", solicitud.id_libro)
        .eq("estado", "disponible")
        .order("codigo", { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      setEjemplaresDisponibles(data || []);
    } catch (err) {
      setError(
        "No se pudieron cargar los ejemplares: " + err.message
      );
    } finally {
      setCargandoEjemplares(false);
    }
  }


  async function confirmarAprobacion() {
    if (
      !solicitudAprobar ||
      !ejemplarSeleccionado ||
      !fechaVencimiento ||
      procesando
    ) {
      return;
    }

    setProcesando(true);
    setError("");
    setMensaje("");

    try {
      await aprobarSolicitudPrestamo(
        solicitudAprobar.id_solicitud,
        ejemplarSeleccionado,
        fechaVencimiento
      );

      setSolicitudes((actuales) =>
        actuales.map((solicitud) =>
          solicitud.id_solicitud === solicitudAprobar.id_solicitud
            ? { ...solicitud, estado: "aprobada" }
            : solicitud
        )
      );

      setSolicitudAprobar(null);
      setMensaje(
        "Solicitud aprobada y préstamo registrado correctamente."
      );
    } catch (err) {
      setError(err.message || "No se pudo aprobar la solicitud.");
    } finally {
      setProcesando(false);
    }
  }

  const total = solicitudes.length;
  const pendientes = solicitudes.filter(
    (item) => item.estado === "pendiente"
  ).length;
  const finalizadas = total - pendientes;

  const filtradas = solicitudes.filter((item) => {
    const texto = busqueda.toLowerCase().trim();

    const coincideBusqueda =
      String(item.usuarios?.nombre || "").toLowerCase().includes(texto) ||
      String(item.libros?.titulo || "").toLowerCase().includes(texto);

    return coincideBusqueda &&
      (filtro === "todos" || item.estado === filtro);
  });

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / 10));
  const paginaVisible = Math.min(pagina, totalPaginas);
  const paginaActual = filtradas.slice(
    (paginaVisible - 1) * 10,
    paginaVisible * 10
  );

  function fechaCorta(fecha) {
    if (!fecha) return "—";
    const [anio, mes, dia] = fecha.split("T")[0].split("-");
    return `${dia}/${mes}/${anio}`;
  }

  const etiquetas = {
    pendiente: "Pendiente",
    aprobada: "Aprobada",
    rechazada: "Rechazada",
    cancelada: "Cancelada",
  };

  const clases = {
    pendiente: styles.estadoPrestado,
    aprobada: styles.estadoPrestamo,
    rechazada: styles.estadoRechazadoSolicitud,
    cancelada: styles.estadoBaja,
  };

  return (
    <section className={styles.tarjeta}>
      <div className={styles.encabezado}>
        <div className={styles.titulo}>
          <div className={styles.icono}>
            <ClipboardList size={25} />
          </div>
          <div>
            <h2>Solicitudes de préstamo</h2>
            <p>Consulta las solicitudes recibidas de estudiantes y docentes.</p>
          </div>
        </div>
        <span className={styles.total}>{total} solicitudes</span>
      </div>

      <div className={styles.resumenMisPrestamos}>
        <div className={styles.indicadorMiPrestamo}>
          <ClipboardList size={20} />
          <span>Total de solicitudes</span>
          <strong>{total}</strong>
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

      <div className={styles.buscador}>
        <Search size={20} />
        <input
          type="search"
          placeholder="Buscar por estudiante, docente o libro..."
          aria-label="Buscar solicitudes"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(1);
          }}
        />
      </div>

      <div className={styles.filtrosSanciones}>
        <label htmlFor="filtroSolicitudesAdmin">Mostrar</label>
        <select
          id="filtroSolicitudesAdmin"
          value={filtro}
          onChange={(e) => {
            setFiltro(e.target.value);
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

      {cargando && (
        <p className={styles.mensaje}>Cargando solicitudes...</p>
      )}

      {error && (
        <p className={styles.mensajeError} role="alert">
          Error: {error}
        </p>
      )}

      {!cargando && !error && (
        <>
          <p className={styles.contador}>
            {filtradas.length} resultados encontrados
          </p>

          {filtradas.length === 0 ? (
            <p className={styles.mensaje}>
              {total === 0
                ? "Todavía no hay solicitudes registradas."
                : "No se encontraron solicitudes."}
            </p>
          ) : (
            <>
              <div className={styles.tablaContenedor}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Solicitante</th>
                      <th>Rol</th>
                      <th>Libro</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginaActual.map((solicitud) => (
                      <tr key={solicitud.id_solicitud}>
                        <td>{solicitud.usuarios?.nombre || "—"}</td>
                        <td>
                          {solicitud.usuarios?.rol === "docente"
                            ? "Docente"
                            : "Estudiante"}
                        </td>
                        <td className={styles.nombreLibro}>
                          {solicitud.libros?.titulo || "—"}
                        </td>
                        <td>{fechaCorta(solicitud.fecha_solicitud)}</td>
                        <td>
                          <span className={clases[solicitud.estado]}>
                            {etiquetas[solicitud.estado] || solicitud.estado}
                          </span>
                        </td>


                        <td>
                          {solicitud.estado === "pendiente" ? (
                            <div className={styles.accionesSolicitud}>
                              <button
                                type="button"
                                className={styles.botonAprobarSolicitud}
                                onClick={() => abrirAprobacion(solicitud)}
                                disabled={procesando}
                              >
                                <CheckCircle2 size={15} />
                                Aprobar
                              </button>

                              <button
                                type="button"
                                className={styles.botonCancelarSolicitud}
                                onClick={() => setSolicitudRechazar(solicitud)}
                                disabled={procesando}
                              >
                                Rechazar
                              </button>
                            </div>
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


      {mensaje && (
        <p className={styles.mensajeExito} role="status">
          {mensaje}
        </p>
      )}

      {solicitudRechazar && (
        <div className={styles.fondoModal}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloRechazo"
          >
            <div className={styles.encabezadoModal}>
              <div className={styles.iconoAdvertencia}>
                <ClipboardList size={26} />
              </div>
            </div>

            <h3 id="tituloRechazo">Rechazar solicitud</h3>

            <p>
              ¿Seguro que deseas rechazar la solicitud de este libro?
            </p>

            <strong className={styles.libroEliminar}>
              {solicitudRechazar.libros?.titulo}
            </strong>

            {error && (
              <p className={styles.mensajeError} role="alert">
                {error}
              </p>
            )}

            <div className={styles.accionesModal}>
              <button
                type="button"
                className={styles.cancelar}
                onClick={() => setSolicitudRechazar(null)}
                disabled={procesando}
              >
                Volver
              </button>

              <button
                type="button"
                className={styles.confirmar}
                onClick={confirmarRechazo}
                disabled={procesando}
              >
                {procesando ? "Rechazando..." : "Sí, rechazar"}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* APROBAR SOLICITUD */}

      {solicitudAprobar && (
        <div className={styles.fondoModal}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloAprobar"
          >
            <div className={styles.encabezadoModal}>
              <div className={styles.icono}>
                <CheckCircle2 size={25} />
              </div>
            </div>

            <h3 id="tituloAprobar">Aprobar solicitud</h3>

            <p>Revisa los datos antes de registrar el préstamo.</p>

            <div className={styles.detallesSolicitudAdmin}>
              <p>
                <strong>Solicitante:</strong>{" "}
                {solicitudAprobar.usuarios?.nombre}
              </p>

              <p>
                <strong>Libro:</strong>{" "}
                {solicitudAprobar.libros?.titulo}
              </p>
            </div>

            <div className={styles.campoSolicitudAdmin}>
              <label htmlFor="ejemplarAprobar">
                Ejemplar disponible
              </label>

              <select
                id="ejemplarAprobar"
                value={ejemplarSeleccionado}
                onChange={(e) =>
                  setEjemplarSeleccionado(e.target.value)
                }
                disabled={procesando || cargandoEjemplares}
              >
                <option value="">
                  {cargandoEjemplares
                    ? "Cargando ejemplares..."
                    : "Selecciona un ejemplar"}
                </option>

                {ejemplaresDisponibles.map((item) => (
                  <option
                    key={item.id_ejemplar}
                    value={item.id_ejemplar}
                  >
                    {item.codigo}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.campoSolicitudAdmin}>
              <label htmlFor="fechaAprobar">
                <CalendarDays size={16} />
                Fecha de vencimiento
              </label>

              <input
                id="fechaAprobar"
                type="date"
                value={fechaVencimiento}
                min={(() => {
                  const hoy = new Date();
                  const anio = hoy.getFullYear();
                  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
                  const dia = String(hoy.getDate()).padStart(2, "0");
                  return `${anio}-${mes}-${dia}`;
                })()}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                disabled={procesando}
              />
            </div>

            {!cargandoEjemplares &&
              ejemplaresDisponibles.length === 0 && (
                <p className={styles.mensajeError}>
                  No hay ejemplares disponibles para aprobar esta solicitud.
                </p>
              )}

            {error && (
              <p className={styles.mensajeError} role="alert">
                {error}
              </p>
            )}

            <div className={styles.accionesModal}>
              <button
                type="button"
                className={styles.cancelar}
                onClick={() => setSolicitudAprobar(null)}
                disabled={procesando}
              >
                Volver
              </button>

              <button
                type="button"
                className={styles.botonAprobarSolicitud}
                onClick={confirmarAprobacion}
                disabled={
                  procesando ||
                  cargandoEjemplares ||
                  ejemplaresDisponibles.length === 0 ||
                  !ejemplarSeleccionado ||
                  !fechaVencimiento
                }
              >
                {procesando
                  ? "Aprobando..."
                  : "Aprobar y registrar préstamo"}
              </button>
            </div>
          </div>
        </div>
      )}


    </section>
  );
}
