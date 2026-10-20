"use client";

import { useEffect, useState } from "react";
import { listarLibros, eliminarLibroSeguro } from "@/services/librosService";
import {
  LibraryBig,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TriangleAlert,
  X
} from "lucide-react";

import styles from "./TablaLibros.module.css";

const LIBROS_POR_PAGINA = 10;

export default function TablaLibros({ actualizacion, alEditar }) {
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [eliminando, setEliminando] = useState(null);
  const [mensajeEliminar, setMensajeEliminar] = useState("");
  const [libroPendienteEliminar, setLibroPendienteEliminar] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);

  useEffect(() => {
    let activo = true;

    async function cargarLibros() {
      setCargando(true);
      setError("");

      try {
        const datos = await listarLibros();

        if (activo) {
          setLibros(datos || []);
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

    cargarLibros();

    return () => {
      activo = false;
    };
  }, [actualizacion]);

  function confirmarEliminacion(libro) {
    setLibroPendienteEliminar(libro);
  }

  async function ejecutarEliminacion() {
    if (!libroPendienteEliminar || eliminando !== null) return;

    const libro = libroPendienteEliminar;

    setEliminando(libro.id_libro);
    setMensajeEliminar("");

    try {
      await eliminarLibroSeguro(libro.id_libro);

      const datos = await listarLibros();
      setLibros(datos || []);

      setLibroPendienteEliminar(null);
      setMensajeEliminar("Libro eliminado correctamente.");
    } catch (error) {
      setLibroPendienteEliminar(null);
      setMensajeEliminar("Error: " + error.message);
    } finally {
      setEliminando(null);
    }
  }

  function cancelarEliminacion() {
    if (eliminando !== null) return;
    setLibroPendienteEliminar(null);
  }

  const librosFiltrados = libros.filter((libro) => {
    const texto = busqueda.toLowerCase().trim();

    return (
      String(libro.isbn || "").toLowerCase().includes(texto) ||
      String(libro.titulo || "").toLowerCase().includes(texto) ||
      String(libro.autor || "").toLowerCase().includes(texto) ||
      String(libro.categoria || "").toLowerCase().includes(texto)
    );
  });

  const totalPaginas = Math.max(
    1,
    Math.ceil(librosFiltrados.length / LIBROS_POR_PAGINA)
  );

  const paginaVisible = Math.min(paginaActual, totalPaginas);

  const librosPagina = librosFiltrados.slice(
    (paginaVisible - 1) * LIBROS_POR_PAGINA,
    paginaVisible * LIBROS_POR_PAGINA
  );

  function cambiarBusqueda(valor) {
    setBusqueda(valor);
    setPaginaActual(1);
  }

  return (
    <section className={styles.tarjeta}>
      <div className={styles.encabezado}>
        <div className={styles.titulo}>
          <div className={styles.icono}>
            <LibraryBig size={25} />
          </div>

          <div>
            <h2>Catálogo de libros</h2>
            <p>Consulta y administra los libros registrados.</p>
          </div>
        </div>

        <span className={styles.total}>
          {libros.length} libros
        </span>
      </div>

      <div className={styles.buscador}>
        <Search size={20} />

        <input
          type="search"
          aria-label="Buscar libros"
          placeholder="Buscar por ISBN, título, autor o categoría..."
          value={busqueda}
          onChange={(e) => cambiarBusqueda(e.target.value)}
        />
      </div>

      {mensajeEliminar && (
        <p
          role="status"
          className={
            mensajeEliminar.startsWith("Error")
              ? styles.mensajeError
              : styles.mensajeExito
          }
        >
          {mensajeEliminar}
        </p>
      )}

      {cargando && <p className={styles.mensaje}>Cargando libros...</p>}

      {error && <p className={styles.mensajeError}>{error}</p>}

      {!cargando && !error && (
        <>
          <p className={styles.contador}>
            {librosFiltrados.length} resultados encontrados
          </p>

          {librosFiltrados.length === 0 ? (
            <p className={styles.mensaje}>
              No se encontraron libros.
            </p>
          ) : (
            <>
              <div className={styles.tablaContenedor}>
                <table className={styles.tabla}>
                  <thead>
                    <tr>
                      <th>ISBN</th>
                      <th>Título</th>
                      <th>Autor</th>
                      <th>Categoría</th>
                      <th>Disponibles</th>
                      <th>Total</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {librosPagina.map((libro) => (
                      <tr key={libro.id_libro}>
                        <td>{libro.isbn}</td>
                        <td className={styles.nombreLibro}>
                          {libro.titulo}
                        </td>
                        <td>{libro.autor}</td>
                        <td>{libro.categoria}</td>
                        <td>{libro.disponibles}</td>
                        <td>{libro.total}</td>

                        <td>
                          <div className={styles.acciones}>
                            <button
                              type="button"
                              className={styles.editar}
                              onClick={() => alEditar(libro)}
                            >
                              <Pencil size={15} />
                              Editar
                            </button>

                            <button
                              type="button"
                              className={styles.eliminar}
                              onClick={() => confirmarEliminacion(libro)}
                              disabled={eliminando !== null}
                            >
                              <Trash2 size={15} />
                              {eliminando === libro.id_libro
                                ? "Eliminando..."
                                : "Eliminar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPaginas > 1 && (
                <nav
                  className={styles.paginacion}
                  aria-label="Paginación de libros"
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

      {libroPendienteEliminar && (
        <div className={styles.fondoModal}>
          <div
            className={styles.modal}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="tituloEliminarLibro"
            aria-describedby="descripcionEliminarLibro"
          >
            <div className={styles.encabezadoModal}>
              <div className={styles.iconoAdvertencia}>
                <TriangleAlert size={27} />
              </div>

              <button
                type="button"
                className={styles.cerrar}
                onClick={cancelarEliminacion}
                disabled={eliminando !== null}
                aria-label="Cerrar ventana"
              >
                <X size={20} />
              </button>
            </div>

            <h3 id="tituloEliminarLibro">
              Confirmar eliminación
            </h3>

            <p id="descripcionEliminarLibro">
              ¿Estás seguro de que deseas eliminar este libro?
            </p>

            <strong className={styles.libroEliminar}>
              {libroPendienteEliminar.titulo}
            </strong>

            <p className={styles.advertencia}>
              Esta acción no se puede deshacer.
            </p>

            <div className={styles.accionesModal}>
              <button
                type="button"
                className={styles.cancelar}
                onClick={cancelarEliminacion}
                disabled={eliminando !== null}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.confirmar}
                onClick={ejecutarEliminacion}
                disabled={eliminando !== null}
              >
                <Trash2 size={16} />
                {eliminando !== null
                  ? "Eliminando..."
                  : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
