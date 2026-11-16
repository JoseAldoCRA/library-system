
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 4002;

app.use(cors({
  origin: "http://localhost:3002"
}));

app.use(express.json());

app.get("/api/catalogo/salud", (req, res) => {
  res.json({
    mensaje: "Microservicio de Catálogo funcionando correctamente",
    estado: "activo",
    puerto: PORT
  });
});

app.listen(PORT, () => {
  console.log(`Microservicio de Catálogo ejecutándose en http://localhost:${PORT}`);
});
