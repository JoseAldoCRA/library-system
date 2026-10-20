"use client";

import { useEffect, useState } from "react";
import { listarCategorias, registrarNuevoLibro, } from "@/services/librosService";
import { BookPlus, Plus } from "lucide-react";
import styles from "./FormularioLibro.module.css";

export default function FormularioLibro({ alRegistrar }) {
  const [isbn, setIsbn] = useState("");
  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

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
          <select
            id="categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            required
          >
            <option value="">Selecciona una categoría</option>

            {categorias.map((item) => (
              <option key={item.id_categoria} value={item.id_categoria}>
                {item.nombre}
              </option>
            ))}
          </select>
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
