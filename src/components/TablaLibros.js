"use client";

import { useEffect, useState } from "react";
import { listarLibros, eliminarLibroSeguro } from "@/services/librosService";

export default function TablaLibros({ actualizacion, alEditar }) {
  const [libros, setLibros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [eliminando, setEliminando] = useState(null);
  const [mensajeEliminar, setMensajeEliminar] = useState("");
  const [libroPendienteEliminar, setLibroPendienteEliminar] = useState(null);

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

  function confirmarEliminacion(libro) {
    setLibroPendienteEliminar(libro);
  }

  async function ejecutarEliminacion() {
    if (!libroPendienteEliminar || eliminando !== null) return;

    const libro = libroPendienteEliminar;

    setEliminando(libro.id_libro);
    setMensajeEliminar("");

    try {
      await eliminarLibroSeguro(libro.id_libro);

      const datos = await listarLibros();
      setLibros(datos);

      setLibroPendienteEliminar(null);
      setMensajeEliminar("Libro eliminado correctamente.");
    } catch (error) {
      setLibroPendienteEliminar(null);
      setMensajeEliminar("Error: " + error.message);
    } finally {
      setEliminando(null);
    }
  }

  function cancelarEliminacion() {
    if (eliminando !== null) return;

    setLibroPendienteEliminar(null);
  }

  return (
    <div style={{ marginTop: "30px" }}>
      <h2 style={{ color: "#194b78", marginBottom: "15px" }}>
        Catálogo de libros
      </h2>

      {libroPendienteEliminar && (
        <div
          role="presentation"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="tituloEliminarLibro"
            aria-describedby="descripcionEliminarLibro"
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "460px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                backgroundColor: "#194b78",
                padding: "20px 24px",
              }}
            >
              <h3
                id="tituloEliminarLibro"
                style={{
                  color: "#ffffff",
                  margin: 0,
                  fontSize: "21px",
                }}
              >
                Confirmar eliminación
              </h3>
            </div>

            <div style={{ padding: "24px" }}>
              <p
                id="descripcionEliminarLibro"
                style={{
                  color: "#334155",
                  fontSize: "16px",
                  marginBottom: "14px",
                }}
              >
                ¿Estás seguro de que deseas eliminar este libro?
              </p>

              <p
                style={{
                  color: "#194b78",
                  fontSize: "17px",
                  fontWeight: "bold",
                  marginBottom: "20px",
                }}
              >
                {libroPendienteEliminar.titulo}
              </p>

              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#991b1b",
                  padding: "12px",
                  borderRadius: "7px",
                  marginBottom: "24px",
                  fontSize: "14px",
                }}
              >
                Esta acción no se puede deshacer.
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={cancelarEliminacion}
                  disabled={eliminando !== null}
                  style={{
                    backgroundColor: "#e2e8f0",
                    color: "#334155",
                    border: "none",
                    padding: "11px 18px",
                    borderRadius: "7px",
                    cursor: eliminando !== null ? "not-allowed" : "pointer",
                    opacity: eliminando !== null ? 0.6 : 1,
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={ejecutarEliminacion}
                  disabled={eliminando !== null}
                  style={{
                    backgroundColor: "#b91c1c",
                    color: "#ffffff",
                    border: "none",
                    padding: "11px 18px",
                    borderRadius: "7px",
                    cursor: eliminando !== null ? "not-allowed" : "pointer",
                    opacity: eliminando !== null ? 0.6 : 1,
                  }}
                >
                  {eliminando !== null ? "Eliminando..." : "Sí, eliminar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mensajeEliminar && (
        <p
          role="status"
          style={{
            marginTop: "12px",
            marginBottom: "12px",
            color: mensajeEliminar.startsWith("Error") ? "#b91c1c" : "#166534",
          }}
        >
          {mensajeEliminar}
        </p>
      )}

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
                <th style={{ padding: "12px" }}>Acciones</th>
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

                  <td style={{ padding: "12px" }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => alEditar(libro)}
                        style={{
                          backgroundColor: "#194b78",
                          color: "white",
                          padding: "8px 14px",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          width: "100px",
                        }}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => confirmarEliminacion(libro)}
                        disabled={eliminando !== null}
                        style={{
                          backgroundColor: "#b91c1c",
                          color: "white",
                          padding: "8px 14px",
                          border: "none",
                          borderRadius: "6px",
                          cursor:
                            eliminando !== null ? "not-allowed" : "pointer",
                          opacity: eliminando !== null ? 0.6 : 1,
                          width: "100px",
                        }}
                      >
                        {eliminando === libro.id_libro
                          ? "Eliminando..."
                          : "Eliminar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
