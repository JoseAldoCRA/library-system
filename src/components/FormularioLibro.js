"use client";

import { useEffect, useRef, useState } from "react";
import {
  listarCategorias,
  registrarNuevoLibro,
} from "@/services/librosService";
import { BookPlus, Plus, SlidersHorizontal } from "lucide-react";
import styles from "./FormularioLibro.module.css";
import estilosCategorias from "@/app/catalogo.module.css";

export default function FormularioLibro({ alRegistrar }) {
  const [isbn, setIsbn] = useState("");
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  const [menuCategoriasAbierto, setMenuCategoriasAbierto] = useState(false);
  const [busquedaCategoria, setBusquedaCategoria] = useState("");
  const selectorRef = useRef(null);

  const categoriaSeleccionada = categorias.find(
    (item) => String(item.id_categoria) === String(categoria),
  );

  const categoriasVisibles = categorias.filter((item) =>
    item.nombre.toLowerCase().includes(busquedaCategoria.toLowerCase()),
  );

  useEffect(() => {
    function cerrarMenu(evento) {
      if (selectorRef.current && !selectorRef.current.contains(evento.target)) {
        setMenuCategoriasAbierto(false);
        setBusquedaCategoria("");
      }
    }

    document.addEventListener("pointerdown", cerrarMenu);

    return () => {
      document.removeEventListener("pointerdown", cerrarMenu);
    };
  }, []);

  useEffect(() => {
    async function cargarCategorias() {
      try {
        const datos = await listarCategorias();
        setCategorias(datos);
      } catch (error) {
        setMensaje("Error al cargar categorías: " + error.message);
      }
    }

    cargarCategorias();
  }, []);

  async function registrarLibro(evento) {
    evento.preventDefault();

    if (guardando) return;

    if (!categoria) {
      setMensaje("Selecciona una categoría antes de registrar el libro.");
      return;
    }

    setGuardando(true);
    setMensaje("");

    try {
      await registrarNuevoLibro({
        isbn,
        titulo,
        autor,
        id_categoria: categoria,
      });

      if (alRegistrar) {
        alRegistrar();
      }

      setMensaje("Libro registrado correctamente.");

      setIsbn("");
      setTitulo("");
      setAutor("");
      setCategoria("");
    } catch (error) {
      setMensaje("Error: " + error.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className={styles.tarjeta}>
      <div className={styles.encabezado}>
        <div className={styles.icono}>
          <BookPlus size={25} />
        </div>

        <div>
          <h2>Registrar nuevo libro</h2>
          <p>Completa los datos para agregar un libro al catálogo.</p>
        </div>
      </div>

      <form onSubmit={registrarLibro}>
        <div className={styles.campos}>
          <div className={styles.grupo}>
            <label htmlFor="isbn">ISBN</label>
            <input
              id="isbn"
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              required
            />
          </div>

          <div className={styles.grupo}>
            <label htmlFor="titulo">Título</label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>

          <div className={styles.grupo}>
            <label htmlFor="autor">Autor</label>
            <input
              id="autor"
              type="text"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              required
            />
          </div>

          <div className={styles.grupo}>
            <label htmlFor="categoria">Categoría</label>
            <div
              ref={selectorRef}
              className={estilosCategorias.filtroCategoriaModerno}
              style={{ width: "100%", marginLeft: 0 }}
            >
              <button
                id="categoria"
                type="button"
                className={estilosCategorias.botonFiltroCategorias}
                aria-expanded={menuCategoriasAbierto}
                aria-controls="lista-categorias-registro"
                onClick={() => setMenuCategoriasAbierto(!menuCategoriasAbierto)}
              >
                <SlidersHorizontal size={19} />
                <span>
                  {categoriaSeleccionada?.nombre || "Selecciona una categoría"}
                </span>
                <span className={estilosCategorias.flechaCategoria}>
                  {menuCategoriasAbierto ? "⌃" : "⌄"}
                </span>
              </button>

              {menuCategoriasAbierto && (
                <div
                  id="lista-categorias-registro"
                  className={estilosCategorias.panelCategorias}
                  onKeyDown={(evento) => {
                    if (evento.key === "Escape") {
                      setMenuCategoriasAbierto(false);
                      setBusquedaCategoria("");
                    }
                  }}
                >
                  <input
                    type="search"
                    className={estilosCategorias.buscarCategoria}
                    placeholder="Buscar categoría..."
                    aria-label="Buscar categoría"
                    value={busquedaCategoria}
                    onChange={(evento) =>
                      setBusquedaCategoria(evento.target.value)
                    }
                  />

                  <div className={estilosCategorias.listaCategorias}>
                    {categoriasVisibles.map((item) => {
                      const seleccionada =
                        String(item.id_categoria) === String(categoria);

                      return (
                        <button
                          key={item.id_categoria}
                          type="button"
                          aria-pressed={seleccionada}
                          className={`${estilosCategorias.opcionCategoria} ${
                            seleccionada
                              ? estilosCategorias.categoriaActiva
                              : ""
                          }`}
                          onClick={() => {
                            setCategoria(String(item.id_categoria));
                            setMenuCategoriasAbierto(false);
                            setBusquedaCategoria("");
                          }}
                        >
                          {item.nombre}
                          {seleccionada && <span>✓</span>}
                        </button>
                      );
                    })}

                    {categoriasVisibles.length === 0 && (
                      <p className={estilosCategorias.sinCategorias}>
                        No se encontraron categorías.
                      </p>
                    )}
                  </div>

                  <div className={estilosCategorias.pieCategorias}>
                    {categorias.length} categorías disponibles
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.acciones}>
          <button type="submit" disabled={guardando}>
            <Plus size={18} />
            {guardando ? "Registrando..." : "Registrar libro"}
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

const estiloInput = {
  display: "block",
  width: "100%",
  marginTop: "8px",
  padding: "12px",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  backgroundColor: "#ffffff",
  color: "#334155",
  boxSizing: "border-box",
};
