const express = require("express");
const cors = require("cors");
require("dotenv").config();
const verificarToken = require("./middlewares/verificarToken");
const verificarBibliotecario = require("./middlewares/verificarBibliotecario");
const {
  registrarNuevoPrestamo,
  listarPrestamosActivos,
  registrarDevolucion,
  listarHistorialDevoluciones,
  listarMisPrestamos
} = require("./services/prestamosService");

const app = express();
const PORT = process.env.PORT || 4003;

app.use(cors({
  origin: "http://localhost:3002"
}));

app.use(express.json());

// Comprobar que el microservicio funciona
app.get("/api/prestamos/salud", (req, res) => {
  return res.status(200).json({
    mensaje: "Microservicio de Préstamos funcionando correctamente."
  });
});

// Comprobar los permisos del bibliotecario
app.get(
  "/api/prestamos/verificar-bibliotecario",
  verificarToken,
  verificarBibliotecario,
  (req, res) => {
    return res.status(200).json({
      mensaje: "Acceso autorizado para bibliotecario."
    });
  }
);

 // Registrar un nuevo préstamo
app.post(
  "/api/prestamos",
  verificarToken,
  verificarBibliotecario,
  async (req, res) => {
    try {
      const idPrestamo = await registrarNuevoPrestamo(
        req.body,
        req.token
      );

      return res.status(201).json({
        mensaje: "Préstamo registrado correctamente.",
        id_prestamo: idPrestamo
      });
    } catch (error) {
      console.error("Error al registrar préstamo:", error.message);

      const erroresValidacion = [
        "Debes seleccionar un usuario válido.",
        "Debes seleccionar un ejemplar válido.",
        "Debes seleccionar una fecha de vencimiento válida.",
        "La fecha de vencimiento no es válida.",
        "El usuario no existe.",
        "El usuario está inactivo.",
        "Este usuario no puede recibir préstamos.",
        "El ejemplar no existe.",
        "El ejemplar no está disponible.",
        "El ejemplar ya tiene un préstamo activo."
      ];

      if (
        erroresValidacion.includes(error.message) ||
        error.message.startsWith(
          "El usuario ha alcanzado el límite de"
        )
      ) {
        return res.status(400).json({
          error: error.message
        });
      }

      return res.status(500).json({
        error: "No se pudo registrar el préstamo."
      });
    }
  }
);


 // Consultar los préstamos activos
app.get(
  "/api/prestamos/activos",
  verificarToken,
  verificarBibliotecario,
  async (req, res) => {
    try {
      const prestamos = await listarPrestamosActivos(req.token);

      return res.status(200).json(prestamos);
    } catch (error) {
      console.error(
        "Error al consultar préstamos activos:",
        error.message
      );

      return res.status(500).json({
        error: "No se pudieron consultar los préstamos activos."
      });
    }
  }
);

 // Registrar la devolución de un préstamo
app.post(
  "/api/prestamos/:id/devolucion",
  verificarToken,
  verificarBibliotecario,
  async (req, res) => {
    try {
      await registrarDevolucion(req.params.id, req.token);

      return res.status(200).json({
        mensaje: "Devolución registrada correctamente."
      });
    } catch (error) {
      console.error("Error al registrar devolución:", error.message);

      const erroresValidacion = [
        "Debes seleccionar un préstamo válido.",
        "El préstamo no existe.",
        "Este préstamo ya fue devuelto.",
        "El ejemplar no está marcado como prestado."
      ];

      if (erroresValidacion.includes(error.message)) {
        return res.status(400).json({
          error: error.message
        });
      }

      return res.status(500).json({
        error: "No se pudo registrar la devolución."
      });
    }
  }
);


 // Consultar el historial de devoluciones
app.get(
  "/api/prestamos/historial",
  verificarToken,
  verificarBibliotecario,
  async (req, res) => {
    try {
      const historial = await listarHistorialDevoluciones(req.token);

      return res.status(200).json(historial);
    } catch (error) {
      console.error(
        "Error al consultar historial de devoluciones:",
        error.message
      );

      return res.status(500).json({
        error: "No se pudo consultar el historial de devoluciones."
      });
    }
  }
);

 // Consultar los préstamos del estudiante o docente autenticado
app.get(
  "/api/prestamos/mios",
  verificarToken,
  async (req, res) => {
    try {
      const prestamos = await listarMisPrestamos(
        req.token,
        req.usuarioAuth.id
      );

      return res.status(200).json(prestamos);
    } catch (error) {
      console.error(
        "Error al consultar mis préstamos:",
        error.message
      );

      if (error.message === "No tienes permiso para consultar préstamos.") {
        return res.status(403).json({
          error: error.message
        });
      }

      if (error.message === "No se pudo consultar el perfil del usuario.") {
        return res.status(404).json({
          error: error.message
        });
      }

      return res.status(500).json({
        error: "No se pudieron consultar tus préstamos."
      });
    }
  }
);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(
    `Microservicio de Préstamos ejecutándose en http://localhost:${PORT}`
  );
});
