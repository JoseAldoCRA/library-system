"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  LibraryBig,
  UserRound,
  Search,
  BookOpen,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  X,
  BookPlus,
  FileText,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import {
  obtenerLibros,
  obtenerCategorias
} from "@/repositories/librosRepository";

import { obtenerUsuarioActual } from "@/services/authService";
import styles from "./catalogo.module.css";

const LIBROS_POR_PAGINA = 12;

export default function Home() {
  const router = useRouter();

  const [libros, setLibros] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [libroSeleccionado, setLibroSeleccionado] = useState(null);
  const [mostrarResumen, setMostrarResumen] = useState(false);

  const [consultandoCuenta, setConsultandoCuenta] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);

  // Consultar libros y categorías

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
        console.error(error);
        setError("No se pudo cargar el catálogo de libros.");
      } finally {
        setCargando(false);
      }
    }

    cargarCatalogo();
  }, []);

  // Cerrar ventana de detalles con Escape

  useEffect(() => {
    if (!libroSeleccionado) return;

    function manejarTecla(evento) {
      if (evento.key === "Escape") {
        setLibroSeleccionado(null);
        setMostrarResumen(false);
      }
    }

    window.addEventListener("keydown", manejarTecla);

    return () => {
      window.removeEventListener("keydown", manejarTecla);
    };
  }, [libroSeleccionado]);

  // Navegación de Mi cuenta

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

  // Filtros del catálogo

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

  // Paginación

  const totalPaginas = Math.max(
    1,
    Math.ceil(librosFiltrados.length / LIBROS_POR_PAGINA)
  );

  const librosPagina = librosFiltrados.slice(
    (paginaActual - 1) * LIBROS_POR_PAGINA,
    paginaActual * LIBROS_POR_PAGINA
  );

  function cambiarBusqueda(valor) {
    setBusqueda(valor);
    setPaginaActual(1);
  }

  function cambiarCategoria(valor) {
    setCategoriaSeleccionada(valor);
    setPaginaActual(1);
  }

  function cambiarPagina(numero) {
    setPaginaActual(numero);

    document.getElementById("catalogo")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function abrirLibro(libro) {
    setLibroSeleccionado(libro);
    setMostrarResumen(false);
  }

  function cerrarLibro() {
    setLibroSeleccionado(null);
    setMostrarResumen(false);
  }

  function contarDisponibles(libro) {
    return (libro.ejemplares || []).filter(
      (ejemplar) =>
        ejemplar.estado?.toLowerCase() === "disponible"
    ).length;
  }

  return (
    <main className={styles.pagina}>

      {/* ENCABEZADO */}

      <header className={styles.encabezado}>
        <div className={styles.navegacion}>

          <Link href="/" className={styles.marca}>
            <LibraryBig size={32} strokeWidth={1.7} />

            <span className={styles.nombreMarca}>
              <strong>BIBLIOTECA</strong>
              <small>CATÁLOGO DIGITAL</small>
            </span>
          </Link>

          <div className={styles.menuDerecho}>
            <a href="#catalogo" className={styles.enlaceCatalogo}>
              Explorar libros
            </a>

            <button
              type="button"
              className={styles.botonLogin}
              onClick={irAMiCuenta}
              disabled={consultandoCuenta}
            >
              <UserRound size={18} />
              {consultandoCuenta ? "Cargando..." : "Mi cuenta"}
            </button>
          </div>

        </div>
      </header>

      {/* BIENVENIDA */}

      <section className={styles.bienvenida}>
        <div className={styles.bienvenidaContenido}>

          <span className={styles.etiquetaBienvenida}>
            EXPLORA · DESCUBRE · APRENDE
          </span>

          <h1>Cada libro abre un mundo nuevo.</h1>

          <p>
            Descubre nuevas historias, explora autores y
            encuentra el conocimiento que buscas.
          </p>

          <div className={styles.buscador}>
            <Search size={22} />

            <input
              type="search"
              aria-label="Buscar libros"
              placeholder="Buscar por título, autor o ISBN..."
              value={busqueda}
              onChange={(e) => cambiarBusqueda(e.target.value)}
            />
          </div>

        </div>
      </section>

      {/* CATÁLOGO */}

      <section
        id="catalogo"
        className={styles.seccionCatalogo}
      >

        <div className={styles.tituloSeccion}>
          <div>
            <span className={styles.etiquetaSeccion}>
              NUESTRA COLECCIÓN
            </span>

            <h2>Explora el catálogo</h2>

            <p>
              Encuentra tu próxima lectura entre nuestros libros.
            </p>
          </div>

          <div className={styles.filtroCategoria}>
            <SlidersHorizontal size={19} />

            <select
              className={styles.selectorCategorias}
              aria-label="Filtrar por categoría"
              value={categoriaSeleccionada}
              onChange={(e) => cambiarCategoria(e.target.value)}
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
              <div className={styles.sinResultados}>
                <Search size={35} />

                <h3>No encontramos libros</h3>

                <p>
                  Prueba con otro título, autor o categoría.
                </p>
              </div>
            ) : (
              <>
                <div className={styles.cuadricula}>

                  {librosPagina.map((libro) => {
                    const ejemplares = libro.ejemplares || [];
                    const disponibles = contarDisponibles(libro);

                    return (
                      <article
                        key={libro.id_libro}
                        className={styles.tarjetaLibro}
                      >
                        <button
                          type="button"
                          className={styles.botonTarjeta}
                          onClick={() => abrirLibro(libro)}
                          aria-label={`Ver detalles de ${libro.titulo}`}
                        >
                          <div className={styles.portada}>
                            <BookOpen
                              size={60}
                              strokeWidth={1.15}
                            />
                          </div>

                          <div className={styles.informacionLibro}>

                            <span className={styles.categoria}>
                              {libro.categorias?.nombre ||
                                "Sin categoría"}
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
                                {disponibles > 0 ? (
                                  <CheckCircle2 size={15} />
                                ) : (
                                  <XCircle size={15} />
                                )}

                                {disponibles > 0
                                  ? "Disponible"
                                  : "No disponible"}
                              </span>

                              <span>
                                {disponibles} de {ejemplares.length} ejemplares
                              </span>
                            </div>

                            <div className={styles.enlaceDetalles}>
                              <span>Ver detalles</span>
                              <ArrowUpRight size={18} />
                            </div>

                          </div>
                        </button>
                      </article>
                    );
                  })}

                </div>

                {/* PAGINACIÓN */}

                {totalPaginas > 1 && (
                  <nav
                    className={styles.paginacion}
                    aria-label="Páginas del catálogo"
                  >
                    <button
                      type="button"
                      disabled={paginaActual === 1}
                      onClick={() =>
                        cambiarPagina(paginaActual - 1)
                      }
                    >
                      <ChevronLeft size={18} />
                      Anterior
                    </button>

                    <span>
                      Página {paginaActual} de {totalPaginas}
                    </span>

                    <button
                      type="button"
                      disabled={paginaActual === totalPaginas}
                      onClick={() =>
                        cambiarPagina(paginaActual + 1)
                      }
                    >
                      Siguiente
                      <ChevronRight size={18} />
                    </button>
                  </nav>
                )}
              </>
            )}
          </>
        )}

      </section>

      {/* VENTANA DE DETALLES */}

      {libroSeleccionado && (
        <div
          className={styles.fondoModal}
          onClick={cerrarLibro}
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
              onClick={cerrarLibro}
            >
              <X size={22} />
            </button>

            <div className={styles.iconoLibroModal}>
              <BookOpen size={55} strokeWidth={1.3} />
            </div>

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
                  <BookPlus size={19} />
                  Solicitar préstamo
                </Link>

                <button
                  type="button"
                  className={styles.verResumen}
                  onClick={() => setMostrarResumen(true)}
                >
                  <FileText size={19} />
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
                  <ArrowLeft size={18} />
                  Volver a las opciones
                </button>

              </div>
            )}

          </div>
        </div>
      )}

      {/* PIE DE PÁGINA */}

      <footer className={styles.piePagina}>
        <div>
          <LibraryBig size={28} strokeWidth={1.5} />
          <strong>Biblioteca Digital</strong>
        </div>

        <p>Un espacio para descubrir y aprender.</p>
      </footer>

    </main>
  );
}
