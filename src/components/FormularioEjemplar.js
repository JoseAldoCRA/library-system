"use client";

import { useEffect, useRef, useState } from "react";
import { listarLibros } from "@/services/librosService";
import { registrarNuevoEjemplar } from "@/services/ejemplaresService";
import { BookCopy, Plus, SlidersHorizontal } from "lucide-react";
import styles from "./FormularioLibro.module.css";
import estilosCategorias from "@/app/catalogo.module.css";

export default function FormularioEjemplar({ alRegistrar, actualizacion }) {
  const [libros, setLibros] = useState([]);
  const [idLibro, setIdLibro] = useState("");
  const [codigo, setCodigo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [menuLibrosAbierto, setMenuLibrosAbierto] = useState(false);
  const [busquedaLibro, setBusquedaLibro] = useState("");
  const selectorLibroRef = useRef(null);

  const libroSeleccionado = libros.find(
    (libro) => String(libro.id_libro) === String(idLibro),
  );

  const librosVisibles = libros.filter((libro) =>
    libro.titulo.toLowerCase().includes(busquedaLibro.toLowerCase().trim()),
  );

  useEffect(() => {
    async function cargarLibros() {
      try {
        const datos = await listarLibros();
        setLibros(datos);
      } catch (error) {
        setMensaje("Error al cargar libros: " + error.message);
      }
    }

    cargarLibros();
  }, [actualizacion]);

  async function registrarEjemplar(evento) {
    evento.preventDefault();

    if (guardando) return;

    if (!idLibro) {
      setMensaje("Selecciona un libro antes de registrar el ejemplar.");
      return;
    }
    setGuardando(true);
    setMensaje("");

    try {
      await registrarNuevoEjemplar({
        id_libro: idLibro,
        codigo: codigo,
      });

      setMensaje("Ejemplar registrado correctamente.");
      setIdLibro("");
      setCodigo("");

      if (alRegistrar) {
        alRegistrar();
      }
    } catch (error) {
      setMensaje("Error: " + error.message);
    } finally {
      setGuardando(false);
    }
  }

  useEffect(() => {
    function cerrarSelector(evento) {
      if (
        selectorLibroRef.current &&
        !selectorLibroRef.current.contains(evento.target)
      ) {
        setMenuLibrosAbierto(false);
        setBusquedaLibro("");
      }
    }

    function cerrarConEscape(evento) {
      if (evento.key === "Escape") {
        setMenuLibrosAbierto(false);
        setBusquedaLibro("");
      }
    }

    document.addEventListener("mousedown", cerrarSelector);
    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.removeEventListener("mousedown", cerrarSelector);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, []);

  return (
    <section className={styles.tarjeta}>
      <div className={styles.encabezado}>
        <div className={styles.icono}>
          <BookCopy size={25} />
        </div>

        <div>
          <h2>Registrar nuevo ejemplar</h2>
          <p>Agrega una copia física de un libro existente.</p>
        </div>
      </div>

      <form onSubmit={registrarEjemplar}>
        <div className={styles.campos}>
          <div className={styles.grupo}>
            <label htmlFor="libroEjemplar">Libro</label>

            <div
              ref={selectorLibroRef}
              className={estilosCategorias.filtroCategoriaModerno}
              style={{ width: "100%", marginLeft: 0 }}
            >
              <button
                id="libroEjemplar"
                type="button"
                className={estilosCategorias.botonFiltroCategorias}
                style={{
                  height: "49px",
                  minHeight: "49px",
                  padding: "0 16px",
                  boxSizing: "border-box",
                }}
                aria-expanded={menuLibrosAbierto}
                aria-controls="lista-libros-ejemplar"
                onClick={() => {
                  setMenuLibrosAbierto(!menuLibrosAbierto);
                  setBusquedaLibro("");
                }}
              >
                <SlidersHorizontal size={19} />

                <span>
                  {libroSeleccionado?.titulo || "Selecciona un libro"}
                </span>

                <span className={estilosCategorias.flechaCategoria}>
                  {menuLibrosAbierto ? "⌃" : "⌄"}
                </span>
              </button>

              {menuLibrosAbierto && (
                <div
                  id="lista-libros-ejemplar"
                  className={estilosCategorias.panelCategorias}
                >
                  <input
                    type="search"
                    className={estilosCategorias.buscarCategoria}
                    placeholder="Buscar libro..."
                    aria-label="Buscar libro por título"
                    value={busquedaLibro}
                    onChange={(e) => setBusquedaLibro(e.target.value)}
                  />

                  <div className={estilosCategorias.listaCategorias}>
                    {librosVisibles.map((libro) => (
                      <button
                        key={libro.id_libro}
                        type="button"
                        className={`${estilosCategorias.opcionCategoria} ${
                          String(idLibro) === String(libro.id_libro)
                            ? estilosCategorias.categoriaActiva
                            : ""
                        }`}
                        onClick={() => {
                          setIdLibro(String(libro.id_libro));
                          setMenuLibrosAbierto(false);
                          setBusquedaLibro("");
                        }}
                      >
                        <span>{libro.titulo}</span>

                        {String(idLibro) === String(libro.id_libro) && (
                          <span>✓</span>
                        )}
                      </button>
                    ))}

                    {librosVisibles.length === 0 && (
                      <p className={estilosCategorias.sinCategorias}>
                        No se encontraron libros.
                      </p>
                    )}
                  </div>

                  <div className={estilosCategorias.pieCategorias}>
                    {libros.length} libros disponibles
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.grupo}>
            <label htmlFor="codigoEjemplar">Código del ejemplar</label>

            <input
              id="codigoEjemplar"
              type="text"
              style={{
                height: "49px",
                minHeight: "49px",
                boxSizing: "border-box",
              }}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
              placeholder="Ejemplo: EJ-003"
            />
          </div>
        </div>

        <div className={styles.acciones}>
          <button type="submit" disabled={guardando}>
            <Plus size={18} />

            {guardando ? "Registrando..." : "Registrar ejemplar"}
          </button>
        </div>
      </form>

      {mensaje && (
        <p className={styles.mensaje} role="status">
          {mensaje}
        </p>
      )}
    </section>
  );
}
