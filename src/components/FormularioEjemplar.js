"use client";

import { useEffect, useState } from "react";
import { listarLibros } from "@/services/librosService";
import { registrarNuevoEjemplar } from "@/services/ejemplaresService";

export default function FormularioEjemplar({ alRegistrar, actualizacion }) {
  const [libros, setLibros] = useState([]);
  const [idLibro, setIdLibro] = useState("");
  const [codigo, setCodigo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

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

  const estiloInput = {
    width: "100%",
    padding: "12px",
    marginTop: "8px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    backgroundColor: "white",
    color: "#334155",
    boxSizing: "border-box",
  };

  return (
    <div style={{ marginTop: "30px", color: "#334155" }}>
      <h2 style={{ color: "#194b78", marginBottom: "20px" }}>
        Registrar ejemplar
      </h2>

      <form onSubmit={registrarEjemplar}>
        <div style={{ display: "grid", gap: "15px" }}>
          <div>
            <label htmlFor="libroEjemplar">Libro</label>
            <select
              id="libroEjemplar"
              value={idLibro}
              onChange={(e) => setIdLibro(e.target.value)}
              required
              style={estiloInput}
            >
              <option value="">Selecciona un libro</option>
              {libros.map((libro) => (
                <option key={libro.id_libro} value={libro.id_libro}>
                  {libro.titulo}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="codigoEjemplar">Código del ejemplar</label>
            <input
              id="codigoEjemplar"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
              style={estiloInput}
              placeholder="Ejemplo: EJ-003"
            />
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
            {guardando ? "Registrando..." : "Registrar ejemplar"}
          </button>
        </div>
      </form>

      {mensaje && <p style={{ marginTop: "15px" }}>{mensaje}</p>}
    </div>
  );
}
