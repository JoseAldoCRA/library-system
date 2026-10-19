"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { obtenerLibros, obtenerCategorias } from "@/repositories/librosRepository";
import styles from "./catalogo.module.css";
import { useRouter } from "next/navigation";
import { obtenerUsuarioActual } from "@/services/authService";

export default function Home() {
  const [libros, setLibros] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [mostrarResumen, setMostrarResumen] = useState(false);


  const router = useRouter();

  const [consultandoCuenta, setConsultandoCuenta] = useState(false);

  async function irAMiCuenta() {
    if (consultandoCuenta) return;

    setConsultandoCuenta(true);

    try {
      const usuario = await obtenerUsuarioActual();

      if (!usuario) {
        router.push("/login");
        return;
      }

      if (usuario.rol === "bibliotecario") {
        router.push("/bibliotecario");
      } else if (usuario.rol === "estudiante") {
        router.push("/estudiante");
      } else if (usuario.rol === "docente") {
        router.push("/docente");
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Error al consultar la cuenta:", error);
      router.push("/login");
    } finally {
      setConsultandoCuenta(false);
    }
  }

  useEffect(() => {
    async function cargarCatalogo() {
      try {
        const [datosLibros, datosCategorias] = await Promise.all([
          obtenerLibros(),
          obtenerCategorias()
        ]);

        setLibros(datosLibros || []);
        setCategorias(datosCategorias || []);
      } catch (error) {
        setError("No se pudo cargar el catálogo de libros.");
        console.error(error);
      } finally {
        setCargando(false);
      }
    }

    cargarCatalogo();
  }, []);

  const librosFiltrados = libros.filter((libro) => {
    const texto = busqueda.toLowerCase().trim();

    const coincideBusqueda =
      (libro.titulo || "").toLowerCase().includes(texto) ||
      (libro.autor || "").toLowerCase().includes(texto) ||
      (libro.isbn || "").toLowerCase().includes(texto);

    const coincideCategoria =
      categoriaSeleccionada === "" ||
      String(libro.id_categoria) === categoriaSeleccionada;

    return coincideBusqueda && coincideCategoria;
  });

  return (
    <main className={styles.pagina}>
      <header className={styles.encabezado}>
        <div className={styles.navegacion}>
          <Link href="/" className={styles.marca}>
            <span className={styles.iconoMarca}>📚</span>
            <span>Sistema de Biblioteca</span>
          </Link>
          <button
            type="button"
            className={styles.botonLogin}
            onClick={irAMiCuenta}
            disabled={consultandoCuenta}
          >
            {consultandoCuenta ? "Cargando..." : "Mi cuenta"}
          </button>
        </div>
      </header>

      <section className={styles.bienvenida}>
        <div className={styles.bienvenidaContenido}>
          <h1>Encuentra tu próxima lectura</h1>
          <p>
            Explora nuestro catálogo y descubre los libros
            disponibles en la biblioteca.
          </p>

          <div className={styles.buscador}>
            <input
              type="text"
              placeholder="Buscar por título, autor o ISBN..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className={styles.seccionCatalogo}>
        <div className={styles.tituloSeccion}>
          <div>
            <h2>Catálogo de libros</h2>
            <p>Consulta los libros de nuestra colección.</p>
          </div>

          <select
            value={categoriaSeleccionada}
            onChange={(e) => setCategoriaSeleccionada(e.target.value)}
          >
            <option value="">Todas las categorías</option>

            {categorias.map((categoria) => (
              <option
                key={categoria.id_categoria}
                value={String(categoria.id_categoria)}
              >
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        {cargando && (
          <p className={styles.mensaje}>Cargando libros...</p>
        )}

        {error && (
          <p className={styles.mensajeError}>{error}</p>
        )}

        {!cargando && !error && (
          <>
            <p className={styles.contador}>
              {librosFiltrados.length} libros encontrados
            </p>

            {librosFiltrados.length === 0 ? (
              <p className={styles.mensaje}>
                No se encontraron libros con esos criterios.
              </p>
            ) : (
              <div className={styles.cuadricula}>
                {librosFiltrados.map((libro) => {
                  const ejemplares = libro.ejemplares || [];

                  const disponibles = ejemplares.filter(
                    (ejemplar) =>
                      ejemplar.estado?.toLowerCase() === "disponible"
                  ).length;

                  return (
                    <article
                      key={libro.id_libro}
                      className={styles.tarjetaLibro}
                      onClick={() => {
                        setLibroSeleccionado(libro);
                        setMostrarResumen(false);
                      }}
                    >
                      <div className={styles.portada}>
                        <span>📖</span>
                      </div>

                      <div className={styles.informacionLibro}>
                        <span className={styles.categoria}>
                          {libro.categorias?.nombre || "Sin categoría"}
                        </span>

                        <h3>{libro.titulo}</h3>

                        <p className={styles.autor}>
                          {libro.autor}
                        </p>

                        <p className={styles.isbn}>
                          ISBN: {libro.isbn}
                        </p>

                        <div className={styles.disponibilidad}>
                          <span
                            className={
                              disponibles > 0
                                ? styles.disponible
                                : styles.noDisponible
                            }
                          >
                            {disponibles > 0
                              ? "Disponible"
                              : "No disponible"}
                          </span>

                          <span>
                            {disponibles} de {ejemplares.length} ejemplares
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {libroSeleccionado && (
        <div
          className={styles.fondoModal}
          onClick={() => setLibroSeleccionado(null)}
        >
          <div
            className={styles.modalLibro}
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloLibroSeleccionado"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.cerrarModal}
              aria-label="Cerrar ventana"
              onClick={() => setLibroSeleccionado(null)}
            >
              ×
            </button>

            <div className={styles.iconoLibroModal}>📖</div>

            <h2 id="tituloLibroSeleccionado">
              {libroSeleccionado.titulo}
            </h2>

            <p className={styles.autorModal}>
              {libroSeleccionado.autor}
            </p>

            {!mostrarResumen ? (
              <div className={styles.opcionesModal}>
                <Link
                  href={`/login?libro=${libroSeleccionado.id_libro}`}
                  className={styles.solicitarPrestamo}
                >
                  Solicitar préstamo
                </Link>

                <button
                  type="button"
                  className={styles.verResumen}
                  onClick={() => setMostrarResumen(true)}
                >
                  Ver resumen
                </button>
              </div>
            ) : (
              <div className={styles.contenidoResumen}>
                <h3>Resumen del libro</h3>

                <p>
                  {libroSeleccionado.resumen?.trim() ||
                    "Este libro todavía no tiene un resumen registrado."}
                </p>

                <button
                  type="button"
                  className={styles.verResumen}
                  onClick={() => setMostrarResumen(false)}
                >
                  Volver
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <footer className={styles.piePagina}>
        <p>Sistema de Biblioteca</p>
      </footer>
    </main>
  );
}
