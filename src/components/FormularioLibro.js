"use client";

import { useEffect, useState } from "react";
import { listarCategorias, registrarNuevoLibro, } from "@/services/librosService";

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
    <div style={{ marginTop: "30px", color: "#334155" }}>
      <h2 style={{ color: "#194b78", marginBottom: "20px" }}>
        Registrar libro
      </h2>

      <form onSubmit={registrarLibro}>
        <div style={{ display: "grid", gap: "15px" }}>
          <div>
            <label htmlFor="isbn">ISBN</label>
            <input
              id="isbn"
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              required
              style={estiloInput}
            />
          </div>

          <div>
            <label htmlFor="titulo">Título</label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              style={estiloInput}
            />
          </div>

          <div>
            <label htmlFor="autor">Autor</label>
            <input
              id="autor"
              type="text"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              required
              style={estiloInput}
            />
          </div>

          <div>
            <label htmlFor="categoria">Categoría</label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
              style={estiloInput}
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((item) => (
                <option key={item.id_categoria} value={item.id_categoria}>
                  {item.nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={guardando}
            style={{
              backgroundColor: "#194b78",
              color: "white",
              padding: "12px",
              border: "none",
              borderRadius: "6px",
              cursor: guardando ? "not-allowed" : "pointer",
              opacity: guardando ? 0.6 : 1,
            }}
          >
            {guardando ? "Registrando..." : "Registrar libro"}
          </button>
        </div>
      </form>

      {mensaje && <p style={{ marginTop: "15px" }}>{mensaje}</p>}
    </div>
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
