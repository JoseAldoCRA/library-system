"use client";

import { useEffect, useState } from "react";
import { listarLibros } from "@/services/librosService";

export default function TablaLibros({ actualizacion }) {
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarLibros() {
      setCargando(true);
      setError("");

      try {
        const datos = await listarLibros();

        if (activo) {
          setLibros(datos);
        }
      } catch (error) {
        if (activo) {
          setError(error.message);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    cargarLibros();

    return () => {
      activo = false;
    };
  }, [actualizacion]);

  return (
    <div style={{ marginTop: "30px" }}>
      <h2 style={{ color: "#194b78", marginBottom: "15px" }}>
        Catálogo de libros
      </h2>

      {cargando && <p>Cargando libros...</p>}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {!cargando && !error && libros.length === 0 && (
        <p>No hay libros registrados.</p>
      )}

      {!cargando && !error && libros.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ background: "#194b78", color: "white" }}>
                <th style={{ padding: "12px" }}>ISBN</th>
                <th style={{ padding: "12px" }}>Título</th>
                <th style={{ padding: "12px" }}>Autor</th>
                <th style={{ padding: "12px" }}>Categoría</th>
                <th style={{ padding: "12px" }}>Disponibles</th>
                <th style={{ padding: "12px" }}>Total</th>
              </tr>
            </thead>

            <tbody>
              {libros.map((libro) => (
                <tr
                  key={libro.id_libro}
                  style={{
                    borderBottom: "1px solid #ddd",
                    color: "#334155",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <td style={{ padding: "12px" }}>{libro.isbn}</td>
                  <td style={{ padding: "12px" }}>{libro.titulo}</td>
                  <td style={{ padding: "12px" }}>{libro.autor}</td>
                  <td style={{ padding: "12px" }}>{libro.categoria}</td>
                  <td style={{ padding: "12px" }}>{libro.disponibles}</td>
                  <td style={{ padding: "12px" }}>{libro.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
