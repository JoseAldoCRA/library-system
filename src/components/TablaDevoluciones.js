
"use client";

import { useEffect, useState } from "react";
import { listarHistorialDevoluciones } from "@/services/prestamosService";

import {
  BookCheck,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import styles from "./TablaLibros.module.css";

export default function TablaDevoluciones({ actualizacion }) {
  const [devoluciones, setDevoluciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    let activo = true;

    async function cargarDevoluciones() {
      setCargando(true);
      setError("");

      try {
        const datos = await listarHistorialDevoluciones();

        if (activo) {
          setDevoluciones(datos);
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

    cargarDevoluciones();

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

  const filtradas = devoluciones.filter((item) => {
    const texto = busqueda.toLowerCase().trim();

    return (
      item.usuario.toLowerCase().includes(texto) ||
      item.libro.toLowerCase().includes(texto) ||
      item.ejemplar.toLowerCase().includes(texto)
    );
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(filtradas.length / 10)
  );

  const paginaVisible = Math.min(pagina, totalPaginas);

  const devolucionesPagina = filtradas.slice(
    (paginaVisible - 1) * 10,
    paginaVisible * 10
  );

  function tieneRetraso(item) {
    if (!item.fecha_vencimiento || !item.fecha_devolucion) {
      return false;
    }

    return (
      item.fecha_devolucion.split("T")[0] >
      item.fecha_vencimiento.split("T")[0]
    );
  }

  return (
    <section className={styles.tarjeta}>

      <div className={styles.encabezado}>
        <div className={styles.titulo}>
          <div className={styles.icono}>
            <BookCheck size={25} />
          </div>

          <div>
            <h2>Historial de devoluciones</h2>
            <p>
              Consulta los ejemplares que ya fueron devueltos.
            </p>
          </div>
        </div>

        <span className={styles.total}>
          {devoluciones.length} devoluciones
        </span>
      </div>

      <div className={styles.buscador}>
        <Search size={20} />

        <input
          type="search"
          aria-label="Buscar devoluciones"
          placeholder="Buscar por usuario, libro o ejemplar..."
          value={busqueda}
          onChange={(evento) => {
            setBusqueda(evento.target.value);
            setPagina(1);
          }}
        />
      </div>

      {cargando && (
        <p className={styles.mensaje}>
          Cargando devoluciones...
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
            {filtradas.length} resultados encontrados
          </p>

          {filtradas.length === 0 ? (
            <p className={styles.mensaje}>
              {devoluciones.length === 0
                ? "Todavía no hay devoluciones registradas."
                : "No se encontraron resultados."}
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
                      <th>Devolución</th>
                      <th>Estado</th>
                    </tr>
                  </thead>

                  <tbody>
                    {devolucionesPagina.map((item) => (
                      <tr key={item.id_prestamo}>
                        <td>{item.usuario}</td>
                        <td>{item.ejemplar}</td>
                        <td className={styles.nombreLibro}>
                          {item.libro}
                        </td>
                        <td>{mostrarFecha(item.fecha_prestamo)}</td>
                        <td>{mostrarFecha(item.fecha_vencimiento)}</td>
                        <td>{mostrarFecha(item.fecha_devolucion)}</td>
                        <td>
                          <span
                            className={
                              tieneRetraso(item)
                                ? styles.estadoConRetraso
                                : styles.estadoDevuelto
                            }
                          >
                            {tieneRetraso(item)
                              ? "Con retraso"
                              : "A tiempo"}
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
