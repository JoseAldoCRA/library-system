
const express = require("express");
const cors = require("cors");
require("dotenv").config();

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

// Iniciar servidor
app.listen(PUERTO, () => {
  console.log(
    `Microservicio de Usuarios ejecutándose en http://localhost:${PUERTO}`
  );
});
