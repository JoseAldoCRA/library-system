"use client";

import { useEffect, useState } from "react";
import { listarUsuarios } from "@/services/usuariosService";

export default function TablaUsuarios({ actualizacion }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarUsuarios() {
      setCargando(true);
      setError("");

      try {
        const datos = await listarUsuarios();

        if (activo) {
          setUsuarios(datos);
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

    cargarUsuarios();

    return () => {
      activo = false;
    };
  }, [actualizacion]);

  const estiloCelda = {
    padding: "12px",
    borderBottom: "1px solid #ddd",
    backgroundColor: "#ffffff",
    color: "#334155",
  };

  return (
    <section style={{ marginTop: "35px" }}>
      <h2 style={{ color: "#194b78", marginBottom: "20px" }}>
        Gestión de usuarios
      </h2>

      {cargando && (
        <p style={{ color: "#334155" }}>
          Cargando usuarios...
        </p>
      )}

      {error && (
        <p style={{ color: "#b91c1c" }}>
          Error: {error}
        </p>
      )}

      {!cargando && !error && usuarios.length === 0 && (
        <p style={{ color: "#334155" }}>
          No hay usuarios registrados.
        </p>
      )}

      {!cargando && !error && usuarios.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#194b78",
                  color: "white",
                }}
              >
                <th style={{ padding: "12px", textAlign: "left" }}>
                  Nombre
                </th>

                <th style={{ padding: "12px", textAlign: "left" }}>
                  Correo
                </th>

                <th style={{ padding: "12px", textAlign: "left" }}>
                  Rol
                </th>

                <th style={{ padding: "12px", textAlign: "left" }}>
                  Estado
                </th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id_usuario}>
                  <td style={estiloCelda}>{usuario.nombre}</td>
                  <td style={estiloCelda}>{usuario.correo}</td>
                  <td style={estiloCelda}>{usuario.rol}</td>
                  <td style={estiloCelda}>{usuario.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}