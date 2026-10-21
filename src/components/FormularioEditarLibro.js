
"use client";

import { useEffect, useState } from "react";
import { listarCategorias, editarLibro } from "@/services/librosService";
import { BookOpen, Save, X } from "lucide-react";

import styles from "./FormularioEditarLibro.module.css";

export default function FormularioEditarLibro({
  libro,
  alGuardar,
  alCancelar,
}) {
  const [isbn, setIsbn] = useState(libro.isbn || "");
  const [titulo, setTitulo] = useState(libro.titulo || "");
  const [autor, setAutor] = useState(libro.autor || "");
  const [categoria, setCategoria] = useState(
    String(libro.id_categoria ?? "")
  );

  const [categorias, setCategorias] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

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
            <select
              id="editarCategoria"
              value={categoria}
              onChange={(evento) => setCategoria(evento.target.value)}
              required
            >
              <option value="">Selecciona una categoría</option>

              {categorias.map((item) => (
                <option
                  key={item.id_categoria}
                  value={item.id_categoria}
                >
                  {item.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.acciones}>
          <button
            type="submit"
            className={styles.guardar}
            disabled={guardando}
          >
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
