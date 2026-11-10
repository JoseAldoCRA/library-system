"use client";

import { useEffect, useRef, useState } from "react";
import { listarCategorias, editarLibro } from "@/services/librosService";
import { BookOpen, Save, X, SlidersHorizontal } from "lucide-react";

import styles from "./FormularioEditarLibro.module.css";
import estilosCategorias from "@/app/catalogo.module.css";

export default function FormularioEditarLibro({
  libro,
  alGuardar,
  alCancelar,
}) {
  const [isbn, setIsbn] = useState(libro.isbn || "");
  const [titulo, setTitulo] = useState(libro.titulo || "");
  const [autor, setAutor] = useState(libro.autor || "");
  const [categoria, setCategoria] = useState(String(libro.id_categoria ?? ""));

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
    if (!menuCategoriasAbierto) return;

    const estiloAnterior = document.documentElement.style.scrollbarWidth;

    document.documentElement.style.scrollbarWidth = "none";

    return () => {
      document.documentElement.style.scrollbarWidth = estiloAnterior;
    };
  }, [menuCategoriasAbierto]);

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
    let activo = true;

    async function cargarCategorias() {
      try {
        const datos = await listarCategorias();

        if (activo) {
          setCategorias(datos || []);
        }
      } catch (error) {
        if (activo) {
          setMensaje("Error al cargar categorías: " + error.message);
        }
      }
    }

    cargarCategorias();

    return () => {
      activo = false;
    };
  }, []);

  async function guardarCambios(evento) {
    evento.preventDefault();

    if (guardando) return;

    if (!categoria) {
      setMensaje("Selecciona una categoría antes de guardar los cambios.");
      return;
    }

    setGuardando(true);
    setMensaje("");

    try {
      await editarLibro(libro.id_libro, {
        isbn: isbn.trim(),
        titulo: titulo.trim(),
        autor: autor.trim(),
        id_categoria: categoria,
      });

      if (alGuardar) {
        alGuardar();
      }
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
          <BookOpen size={24} />
        </div>

        <div>
          <h2>Editar libro</h2>
          <p>Actualiza la información del libro seleccionado.</p>
        </div>
      </div>

      <form onSubmit={guardarCambios}>
        <div className={styles.campos}>
          <div className={styles.grupo}>
            <label htmlFor="editarIsbn">ISBN</label>
            <input
              id="editarIsbn"
              type="text"
              value={isbn}
              onChange={(evento) => setIsbn(evento.target.value)}
              required
              maxLength={30}
            />
          </div>

          <div className={styles.grupo}>
            <label htmlFor="editarTitulo">Título</label>
            <input
              id="editarTitulo"
              type="text"
              value={titulo}
              onChange={(evento) => setTitulo(evento.target.value)}
              required
            />
          </div>

          <div className={styles.grupo}>
            <label htmlFor="editarAutor">Autor</label>
            <input
              id="editarAutor"
              type="text"
              value={autor}
              onChange={(evento) => setAutor(evento.target.value)}
              required
            />
          </div>

          <div className={styles.grupo}>
            <label htmlFor="editarCategoria">Categoría</label>
            <div
              ref={selectorRef}
              className={estilosCategorias.filtroCategoriaModerno}
              style={{ width: "100%", marginLeft: 0 }}
            >
              <button
                id="editarCategoria"
                type="button"
                className={estilosCategorias.botonFiltroCategorias}
                style={{
                  height: "48px",
                  minHeight: "48px",
                  padding: "0 16px",
                  boxSizing: "border-box",
                }}
                aria-expanded={menuCategoriasAbierto}
                aria-controls="lista-categorias-editar"
                onClick={() => {
                  setMenuCategoriasAbierto(!menuCategoriasAbierto);
                  setBusquedaCategoria("");
                }}
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
                  id="lista-categorias-editar"
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
                    aria-label="Buscar categoría para editar libro"
                    value={busquedaCategoria}
                    onChange={(evento) =>
                      setBusquedaCategoria(evento.target.value)
                    }
                    onKeyDown={(evento) => {
                      if (evento.key === "Enter") evento.preventDefault();
                    }}
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
          <button type="submit" className={styles.guardar} disabled={guardando}>
            <Save size={17} />
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>

          <button
            type="button"
            className={styles.cancelar}
            onClick={alCancelar}
            disabled={guardando}
          >
            <X size={17} />
            Cancelar
          </button>
        </div>
      </form>

      {mensaje && (
        <p className={styles.mensajeError} role="alert">
          {mensaje}
        </p>
      )}
    </section>
  );
}
