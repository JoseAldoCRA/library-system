"use client";

import { useEffect, useState } from "react";
import { listarEjemplares, cambiarEstadoEjemplar, } from "@/services/ejemplaresService";

export default function TablaEjemplares({ actualizacion, alCambiarEstado }) {
  const [ejemplares, setEjemplares] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");

  const [ejemplarSeleccionado, setEjemplarSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarEjemplares() {
      setCargando(true);
      setError("");

      try {
        const datos = await listarEjemplares();

        if (activo) {
          setEjemplares(datos);
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

    cargarEjemplares();

    return () => {
      activo = false;
    };
  }, [actualizacion]);

  const categorias = [
    ...new Set(ejemplares.map((ejemplar) => ejemplar.categoria)),
  ].sort((a, b) => a.localeCompare(b, "es"));

  const ejemplaresFiltrados = ejemplares.filter((ejemplar) => {
    return (
      categoriaSeleccionada === "" ||
      ejemplar.categoria === categoriaSeleccionada
    );
  });

  function abrirConfirmacion(ejemplar) {
    setMensaje("");
    setEjemplarSeleccionado(ejemplar);
  }

  function cancelarCambio() {
    if (guardando) return;
    setEjemplarSeleccionado(null);
  }

  async function confirmarCambio() {
    if (!ejemplarSeleccionado || guardando) return;

    const ejemplar = ejemplarSeleccionado;

    const nuevoEstado =
      ejemplar.estado === "disponible" ? "baja" : "disponible";

    setGuardando(true);
    setMensaje("");

    try {
      await cambiarEstadoEjemplar( ejemplarSeleccionado.id_ejemplar, nuevoEstado);

      if (alCambiarEstado) { alCambiarEstado(); }

      const datos = await listarEjemplares();
      setEjemplares(datos);

      setEjemplarSeleccionado(null);

      setMensaje(
        nuevoEstado === "baja"
          ? "Ejemplar dado de baja correctamente."
          : "Ejemplar reactivado correctamente."
      );
    } catch (error) {
      setMensaje("Error: " + error.message);
      setEjemplarSeleccionado(null);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div style={{ marginTop: "35px" }}>
      <h2 style={{ color: "#194b78", marginBottom: "15px" }}>
        Gestión de ejemplares
      </h2>

      <div style={{ marginBottom: "20px", maxWidth: "350px" }}>
        <label
          htmlFor="filtroCategoriaEjemplares"
          style={{
            display: "block",
            marginBottom: "8px",
            color: "#334155",
            fontWeight: "500",
          }}
        >
          Filtrar por categoría
        </label>

        <select
          id="filtroCategoriaEjemplares"
          value={categoriaSeleccionada}
          onChange={(evento) =>
            setCategoriaSeleccionada(evento.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#ffffff",
            color: "#334155",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          <option value="">Todas las categorías</option>

          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      {mensaje && (
        <p
          role="status"
          style={{
            marginBottom: "15px",
            color: mensaje.startsWith("Error") ? "#b91c1c" : "#166534",
          }}
        >
          {mensaje}
        </p>
      )}

      {cargando && <p>Cargando ejemplares...</p>}

      {error && <p style={{ color: "#b91c1c" }}>Error: {error}</p>}

      {!cargando && !error && ejemplares.length === 0 && (
        <p>No hay ejemplares registrados.</p>
      )}

      {!cargando &&
        !error &&
        ejemplares.length > 0 &&
        ejemplaresFiltrados.length === 0 && (
          <p style={{ color: "#334155" }}>
            No hay ejemplares registrados en esta categoría.
          </p>
        )}

      {!cargando && !error && ejemplaresFiltrados.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#194b78", color: "white" }}>
                <th style={{ padding: "12px" }}>Código</th>
                <th style={{ padding: "12px" }}>ISBN</th>
                <th style={{ padding: "12px" }}>Libro</th>
                <th style={{ padding: "12px" }}>Estado</th>
                <th style={{ padding: "12px" }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {ejemplaresFiltrados.map((ejemplar) => (
                <tr
                  key={ejemplar.id_ejemplar}
                  style={{
                    borderBottom: "1px solid #ddd",
                    backgroundColor: "#ffffff",
                    color: "#334155",
                  }}
                >
                  <td style={{ padding: "12px" }}>{ejemplar.codigo}</td>
                  <td style={{ padding: "12px" }}>{ejemplar.isbn}</td>
                  <td style={{ padding: "12px" }}>{ejemplar.titulo}</td>

                  <td style={{ padding: "12px" }}>
                    {ejemplar.estado === "disponible"
                      ? "Disponible"
                      : ejemplar.estado === "prestado"
                        ? "Prestado"
                        : ejemplar.estado === "baja"
                          ? "De baja"
                          : ejemplar.estado}
                  </td>

                  <td style={{ padding: "12px" }}>
                    {ejemplar.estado === "prestado" ? (
                      <span style={{ color: "#64748b" }}>
                        Sin acciones
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => abrirConfirmacion(ejemplar)}
                        disabled={guardando}
                        style={{
                          backgroundColor:
                            ejemplar.estado === "disponible"
                              ? "#b91c1c"
                              : "#166534",
                          color: "white",
                          padding: "8px 14px",
                          border: "none",
                          borderRadius: "6px",
                          cursor: guardando ? "not-allowed" : "pointer",
                          opacity: guardando ? 0.6 : 1,
                          minWidth: "110px",
                        }}
                      >
                        {ejemplar.estado === "disponible"
                          ? "Dar de baja"
                          : "Reactivar"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {ejemplarSeleccionado && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloConfirmacionEjemplar"
            style={{
              backgroundColor: "#ffffff",
              width: "100%",
              maxWidth: "500px",
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 15px 40px rgba(0,0,0,0.25)",
            }}
          >
            <div
              style={{
                backgroundColor: "#194b78",
                color: "white",
                padding: "18px 22px",
                fontSize: "22px",
                fontWeight: "bold",
              }}
              id="tituloConfirmacionEjemplar"
            >
              {ejemplarSeleccionado.estado === "disponible"
                ? "Confirmar baja de ejemplar"
                : "Confirmar reactivación"}
            </div>

            <div style={{ padding: "24px" }}>
              <p style={{ color: "#334155", marginBottom: "12px" }}>
                {ejemplarSeleccionado.estado === "disponible"
                  ? "¿Estás seguro de que deseas dar de baja este ejemplar?"
                  : "¿Deseas reactivar este ejemplar?"}
              </p>

              <p
                style={{
                  color: "#194b78",
                  fontWeight: "bold",
                  marginBottom: "6px",
                }}
              >
                {ejemplarSeleccionado.codigo}
              </p>

              <p style={{ color: "#334155", marginBottom: "18px" }}>
                {ejemplarSeleccionado.titulo}
              </p>

              <div
                style={{
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  padding: "12px",
                  borderRadius: "6px",
                  marginBottom: "20px",
                }}
              >
                {ejemplarSeleccionado.estado === "disponible"
                  ? "El ejemplar dejará de estar disponible para préstamos."
                  : "El ejemplar volverá a estar disponible para préstamos."}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={cancelarCambio}
                  disabled={guardando}
                  style={{
                    backgroundColor: "#e2e8f0",
                    color: "#334155",
                    padding: "12px 18px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: guardando ? "not-allowed" : "pointer",
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={confirmarCambio}
                  disabled={guardando}
                  style={{
                    backgroundColor:
                      ejemplarSeleccionado.estado === "disponible"
                        ? "#b91c1c"
                        : "#166534",
                    color: "white",
                    padding: "12px 18px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: guardando ? "not-allowed" : "pointer",
                    opacity: guardando ? 0.6 : 1,
                  }}
                >
                  {guardando
                    ? "Guardando..."
                    : ejemplarSeleccionado.estado === "disponible"
                      ? "Sí, dar de baja"
                      : "Sí, reactivar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
