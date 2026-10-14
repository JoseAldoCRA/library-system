
"use client";

import { useEffect, useState } from "react";
import { listarCategorias, editarLibro } from "@/services/librosService";

export default function FormularioEditarLibro({
  libro,
  alGuardar,
  alCancelar
}) {
  const [isbn, setIsbn] = useState(libro.isbn);
  const [titulo, setTitulo] = useState(libro.titulo);
  const [autor, setAutor] = useState(libro.autor);
  const [categoria, setCategoria] = useState(String(libro.id_categoria));
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

  async function guardarCambios(evento) {
    evento.preventDefault();

    if (guardando) return;

    setGuardando(true);
    setMensaje("");

    try {
      await editarLibro(libro.id_libro, {
        isbn,
        titulo,
        autor,
        id_categoria: categoria
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

  const estiloInput = {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    backgroundColor: "white",
    color: "#334155",
    boxSizing: "border-box"
  };

  return (
    <div
      style={{
        marginTop: "25px",
        padding: "20px",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        color: "#334155"
      }}
    >
      <h2 style={{ color: "#194b78", marginBottom: "20px" }}>
        Editar libro
      </h2>

      <form onSubmit={guardarCambios}>
        <div style={{ display: "grid", gap: "15px" }}>
          <div>
            <label>ISBN</label>
            <input
              type="text"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              required
              maxLength={30}
              style={estiloInput}
            />
          </div>

          <div>
            <label>Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              style={estiloInput}
            />
          </div>

          <div>
            <label>Autor</label>
            <input
              type="text"
              value={autor}
              onChange={(e) => setAutor(e.target.value)}
              required
              style={estiloInput}
            />
          </div>

          <div>
            <label>Categoría</label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              required
              style={estiloInput}
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

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={guardando}
              style={{
                backgroundColor: "#194b78",
                color: "white",
                padding: "12px 20px",
                border: "none",
                borderRadius: "6px",
                cursor: guardando ? "not-allowed" : "pointer",
                opacity: guardando ? 0.6 : 1
              }}
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>

            <button
              type="button"
              onClick={alCancelar}
              disabled={guardando}
              style={{
                backgroundColor: "#e2e8f0",
                color: "#334155",
                padding: "12px 20px",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>

      {mensaje && (
        <p style={{ marginTop: "15px", color: "#b91c1c" }}>
          {mensaje}
        </p>
      )}
    </div>
  );
}
