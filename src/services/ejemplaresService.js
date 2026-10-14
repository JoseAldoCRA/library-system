import { insertarEjemplar } from "@/repositories/ejemplaresRepository";

export async function registrarNuevoEjemplar(ejemplar) {
  const id_libro = Number(ejemplar.id_libro);
  const codigo = ejemplar.codigo.trim();

  if (!Number.isInteger(id_libro) || id_libro <= 0 || !codigo) {
    throw new Error("Selecciona un libro e ingresa el código del ejemplar.");
  }

  try {
    return await insertarEjemplar({
      id_libro,
      codigo,
      estado: "disponible"
    });
  } catch (error) {
    if (error.message.includes("ejemplares_codigo_key")) {
      throw new Error("Ya existe un ejemplar registrado con ese código.");
    }

    throw error;
  }
}
