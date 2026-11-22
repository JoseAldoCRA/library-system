
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const verificarToken = require("./middlewares/verificarToken");
const verificarBibliotecario = require("./middlewares/verificarBibliotecario");
const {
  listarUsuarios,
  registrarNuevoUsuario,
} = require("./services/usuariosService");
const app = express();

const PUERTO = Number(process.env.PORT) || 4004;

app.use(
  cors({
    origin: "http://localhost:3002",
  })
);

app.use(express.json());

// Comprobar que el microservicio funciona
app.get("/api/usuarios/salud", (req, res) => {
  res.status(200).json({
    mensaje: "Microservicio de Usuarios funcionando correctamente.",
  });
});

 // Comprobar los permisos del bibliotecario
app.get(
  "/api/usuarios/verificar-bibliotecario",
  verificarToken,
  verificarBibliotecario,
  (req, res) => {
    res.status(200).json({
      mensaje: "Acceso autorizado para bibliotecario.",
      usuario: req.perfilBibliotecario,
    });
  }
);

 // Consultar todos los usuarios registrados
app.get(
  "/api/usuarios",
  verificarToken,
  verificarBibliotecario,
  async (req, res) => {
    try {
      const usuarios = await listarUsuarios(req.token);

      return res.status(200).json(usuarios);
    } catch (error) {
      console.error("Error al consultar usuarios:", error.message);

      return res.status(500).json({
        error: "No se pudo consultar la lista de usuarios.",
      });
    }
  }
);

 // Registrar estudiantes y docentes
app.post(
  "/api/usuarios",
  verificarToken,
  verificarBibliotecario,
  async (req, res) => {
    try {
      const resultado = await registrarNuevoUsuario(req.body);

      return res.status(201).json(resultado);
    } catch (error) {
      console.error("Error al registrar usuario:", error.message);

      if (
        error.message === "Debes completar todos los campos." ||
        error.message === "El nombre es demasiado largo." ||
        error.message === "El correo electrónico no es válido." ||
        error.message === "Solo puedes registrar estudiantes y docentes." ||
        error.message === "La contraseña debe tener entre 8 y 72 caracteres."
      ) {
        return res.status(400).json({
          error: error.message,
        });
      }

      if (
        error.message.includes("already been registered") ||
        error.message.includes("already exists")
      ) {
        return res.status(409).json({
          error: "Ya existe una cuenta con ese correo.",
        });
      }

      if (error.message.includes("La cuenta se creó, pero")) {
        return res.status(500).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "No se pudo registrar el usuario.",
      });
    }
  }
);

// Iniciar servidor
app.listen(PUERTO, () => {
  console.log(
    `Microservicio de Usuarios ejecutándose en http://localhost:${PUERTO}`
  );
});
