"use client";

import { useEffect, useState } from "react";
import { listarLibros } from "@/services/librosService";
import { registrarNuevoEjemplar } from "@/services/ejemplaresService";
import { BookCopy, Plus } from "lucide-react";
import styles from "./FormularioLibro.module.css";

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

  
  return (
    <section className={styles.tarjeta}>

      <div className={styles.encabezado}>
        <div className={styles.icono}>
          <BookCopy size={25} />
        </div>

        <div>
          <h2>Registrar nuevo ejemplar</h2>
          <p>Agrega una copia física de un libro existente.</p>
        </div>
      </div>

      <form onSubmit={registrarEjemplar}>

        <div className={styles.campos}>

          <div className={styles.grupo}>
            <label htmlFor="libroEjemplar">
              Libro
            </label>

            <select
              id="libroEjemplar"
              value={idLibro}
              onChange={(e) => setIdLibro(e.target.value)}
              required
            >
              <option value="">Selecciona un libro</option>

              {libros.map((libro) => (
                <option
                  key={libro.id_libro}
                  value={libro.id_libro}
                >
                  {libro.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.grupo}>
            <label htmlFor="codigoEjemplar">
              Código del ejemplar
            </label>

            <input
              id="codigoEjemplar"
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              required
              placeholder="Ejemplo: EJ-003"
            />
          </div>

        </div>

        <div className={styles.acciones}>
          <button
            type="submit"
            disabled={guardando}
          >
            <Plus size={18} />

            {guardando
              ? "Registrando..."
              : "Registrar ejemplar"}
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


