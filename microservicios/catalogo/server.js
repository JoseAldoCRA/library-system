const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
  listarCategorias,
  listarLibros,
} = require("./services/catalogoService");

const app = express();
const PORT = process.env.PORT || 4002;

app.use(
  cors({
    origin: "http://localhost:3002",
  }),
);

app.use(express.json());

// Comprobar que el microservicio funciona
app.get("/api/catalogo/salud", (req, res) => {
  res.json({
    mensaje: "Microservicio de Catálogo funcionando correctamente",
    estado: "activo",
    puerto: Number(PORT),
  });
});

// Consultar las categorías registradas
app.get("/api/catalogo/categorias", async (req, res) => {
  try {
    const categorias = await listarCategorias();

    res.json(categorias);
  } catch (error) {
    console.error("Error al consultar categorías:", error.message);

    res.status(500).json({
      error: "No se pudieron obtener las categorías.",
    });
  }
});

// Consultar los libros registrados
app.get("/api/catalogo/libros", async (req, res) => {
  try {
    const libros = await listarLibros();

    res.json(libros);
  } catch (error) {
    console.error("Error al consultar libros:", error.message);

    res.status(500).json({
      error: "No se pudieron obtener los libros."
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(
    `Microservicio de Catálogo ejecutándose en http://localhost:${PORT}`,
  );
});
