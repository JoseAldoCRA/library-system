
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { listarCategorias } = require("./services/catalogoService");

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors({
  origin: "http://localhost:3002"
}));

app.use(express.json());

// Comprobar que el microservicio funciona
app.get("/api/catalogo/salud", (req, res) => {
  res.json({
    mensaje: "Microservicio de Catálogo funcionando correctamente",
    estado: "activo",
    puerto: Number(PORT)
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
      error: "No se pudieron obtener las categorías."
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(
    `Microservicio de Catálogo ejecutándose en http://localhost:${PORT}`
  );
});
