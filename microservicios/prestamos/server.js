const express = require("express");
const cors = require("cors");
require("dotenv").config();
const verificarToken = require("./middlewares/verificarToken");
const verificarBibliotecario = require("./middlewares/verificarBibliotecario");
const {
  registrarNuevoPrestamo,
  listarPrestamosActivos
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(
    `Microservicio de Préstamos ejecutándose en http://localhost:${PORT}`
  );
});
