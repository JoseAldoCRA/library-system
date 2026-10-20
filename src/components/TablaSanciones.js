
"use client";

import { useEffect, useState } from "react";

import {
  listarSanciones,
  registrarNuevoPago,
} from "@/services/sancionesService";

import {
  ShieldAlert,
  Search,
  CheckCircle2,
  Clock3,
  Wallet,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import styles from "./TablaLibros.module.css";

export default function TablaSanciones({ actualizacion }) {
  const [sanciones, setSanciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [sancionSeleccionada, setSancionSeleccionada] = useState(null);
  const [guardandoPago, setGuardandoPago] = useState(false);
  const [mensajePago, setMensajePago] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    let activo = true;

    async function cargarSanciones() {
      setCargando(true);
      setError("");

      try {
        const datos = await listarSanciones();

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
  }, [actualizacion]);

  function mostrarFecha(fecha) {
    if (!fecha) return "Sin fecha";

    const partes = fecha.split("T")[0].split("-");

    if (partes.length !== 3) return fecha;

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  function mostrarMonto(monto) {
    return `$${Number(monto).toFixed(2)} MXN`;
  }

  function cancelarPago() {
    if (guardandoPago) return;

    setSancionSeleccionada(null);
  }

  async function confirmarPago() {
    if (!sancionSeleccionada || guardandoPago) {
      return;
    }

    setGuardandoPago(true);
    setMensajePago("");

    try {
      await registrarNuevoPago(sancionSeleccionada.id_sancion);

      setSancionSeleccionada(null);
      setMensajePago("Pago registrado correctamente.");

      try {
        const datos = await listarSanciones();
        setSanciones(datos || []);
      } catch (error) {
        setMensajePago(
          "Pago registrado, pero no se pudo actualizar la tabla: " +
          error.message
        );
      }
    } catch (error) {
      setMensajePago("Error: " + error.message);
    } finally {
      setGuardandoPago(false);
    }
  }

  // Indicadores de sanciones

  const totalSanciones = sanciones.length;

  const totalPendientes = sanciones.filter(
    (item) => item.estado_pago === "pendiente"
  ).length;

  const totalPagadas = sanciones.filter(
    (item) => item.estado_pago === "pagado"
  ).length;

  // Buscar y filtrar

  const sancionesFiltradas = sanciones.filter((item) => {
    const texto = busqueda.toLowerCase().trim();

    const coincideBusqueda =
      String(item.usuario || "").toLowerCase().includes(texto) ||
      String(item.libro || "").toLowerCase().includes(texto) ||
      String(item.ejemplar || "").toLowerCase().includes(texto);

    const coincideEstado =
      filtroEstado === "todos" ||
      item.estado_pago === filtroEstado;

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
            <h2>Sanciones y multas</h2>
            <p>
              Consulta las multas por retraso y registra los pagos.
            </p>
          </div>
        </div>

        <span className={styles.total}>
          {totalSanciones} sanciones
        </span>
      </div>

      {/* INDICADORES */}

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
            <strong>{totalPendientes}</strong>
          </div>
        </div>

        <div className={styles.indicadorSancion}>
          <CheckCircle2 size={20} />
          <div>
            <span>Pagadas</span>
            <strong>{totalPagadas}</strong>
          </div>
        </div>

      </div>

      {/* BÚSQUEDA */}

      <div className={styles.buscador}>
        <Search size={20} />

        <input
          type="search"
          aria-label="Buscar sanciones"
          placeholder="Buscar por usuario, libro o ejemplar..."
          value={busqueda}
          onChange={(evento) => {
            setBusqueda(evento.target.value);
            setPagina(1);
          }}
        />
      </div>

      {/* FILTRO */}

      <div className={styles.filtrosSanciones}>
        <label htmlFor="filtroEstadoSancion">
          Estado de pago
        </label>

        <select
          id="filtroEstadoSancion"
          value={filtroEstado}
          onChange={(evento) => {
            setFiltroEstado(evento.target.value);
            setPagina(1);
          }}
        >
          <option value="todos">Todas las sanciones</option>
          <option value="pendiente">Pendientes</option>
          <option value="pagado">Pagadas</option>
        </select>
      </div>

      {/* MENSAJES */}

      {mensajePago && (
        <p
          role="status"
          className={
            mensajePago.startsWith("Error")
              ? styles.mensajeError
              : styles.mensajeExito
          }
        >
          {mensajePago}
        </p>
      )}

      {cargando && (
        <p className={styles.mensaje}>
          Cargando sanciones...
        </p>
      )}

      {error && (
        <p className={styles.mensajeError}>
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
                ? "No hay sanciones registradas."
                : "No se encontraron sanciones."}
            </p>
          ) : (
            <>
              <div className={styles.tablaContenedor}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Libro</th>
                      <th>Ejemplar</th>
                      <th>Vencimiento</th>
                      <th>Devolución</th>
                      <th>Días de retraso</th>
                      <th>Multa</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {sancionesPagina.map((sancion) => (
                      <tr key={sancion.id_sancion}>
                        <td>{sancion.usuario}</td>

                        <td className={styles.nombreLibro}>
                          {sancion.libro}
                        </td>

                        <td>{sancion.ejemplar}</td>

                        <td>
                          {mostrarFecha(sancion.fecha_vencimiento)}
                        </td>

                        <td>
                          {mostrarFecha(sancion.fecha_devolucion)}
                        </td>

                        <td>{sancion.dias_retraso}</td>

                        <td className={styles.montoSancion}>
                          {mostrarMonto(sancion.monto)}
                        </td>

                        <td>
                          <span
                            className={
                              sancion.estado_pago === "pendiente"
                                ? styles.sancionPendiente
                                : styles.sancionPagada
                            }
                          >
                            {sancion.estado_pago === "pendiente"
                              ? "Pendiente"
                              : "Pagado"}
                          </span>
                        </td>

                        <td>
                          {sancion.estado_pago === "pendiente" ? (
                            <button
                              type="button"
                              className={styles.botonRegistrarPago}
                              disabled={guardandoPago}
                              onClick={() => {
                                setMensajePago("");
                                setSancionSeleccionada(sancion);
                              }}
                            >
                              <Wallet size={16} />
                              Registrar pago
                            </button>
                          ) : (
                            <span className={styles.textoPagado}>
                              <CheckCircle2 size={16} />
                              Pagado
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

      {/* CONFIRMACIÓN DEL PAGO */}

      {sancionSeleccionada && (
        <div className={styles.fondoModal}>
          <div
            className={styles.modalSancion}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="tituloConfirmarPago"
            aria-describedby="descripcionConfirmarPago"
          >
            <div className={styles.encabezadoModalSancion}>
              <div className={styles.icono}>
                <Wallet size={24} />
              </div>

              <div>
                <h3 id="tituloConfirmarPago">
                  Confirmar pago de multa
                </h3>
                <p id="descripcionConfirmarPago">
                  Verifica los datos antes de continuar.
                </p>
              </div>

              <button
                type="button"
                className={styles.cerrarModalSancion}
                onClick={cancelarPago}
                disabled={guardandoPago}
                aria-label="Cerrar ventana"
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.detallesSancion}>
              <p>
                <strong>Usuario:</strong>{" "}
                {sancionSeleccionada.usuario}
              </p>

              <p>
                <strong>Libro:</strong>{" "}
                {sancionSeleccionada.libro}
              </p>

              <p>
                <strong>Ejemplar:</strong>{" "}
                {sancionSeleccionada.ejemplar}
              </p>

              <p>
                <strong>Días de retraso:</strong>{" "}
                {sancionSeleccionada.dias_retraso}
              </p>

              <p>
                <strong>Multa:</strong>{" "}
                {mostrarMonto(sancionSeleccionada.monto)}
              </p>
            </div>

            <div className={styles.accionesModalSancion}>
              <button
                type="button"
                className={styles.cancelarPago}
                disabled={guardandoPago}
                onClick={cancelarPago}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.confirmarPago}
                disabled={guardandoPago}
                onClick={confirmarPago}
              >
                <CheckCircle2 size={17} />

                {guardandoPago
                  ? "Registrando..."
                  : "Sí, registrar pago"}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
