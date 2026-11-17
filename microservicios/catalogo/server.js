const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
  listarCategorias,
  listarLibros,
  listarEjemplares,
  listarEjemplaresDisponibles,
  registrarNuevoLibro,
  editarLibro,
  eliminarLibroSeguro,
} = require("./services/catalogoService");

const verificarToken = require("./middlewares/verificarToken");
const verificarBibliotecario = require("./middlewares/verificarBibliotecario");

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
      error: "No se pudieron obtener los libros.",
    });
  }
});

// Consultar todos los ejemplares
app.get("/api/catalogo/ejemplares", async (req, res) => {
  try {
    const ejemplares = await listarEjemplares();

    res.json(ejemplares);
  } catch (error) {
    console.error("Error al consultar ejemplares:", error.message);

    res.status(500).json({
      error: "No se pudieron obtener los ejemplares.",
    });
  }
});

// Consultar solamente los ejemplares disponibles
app.get("/api/catalogo/ejemplares/disponibles", async (req, res) => {
  try {
    const ejemplares = await listarEjemplaresDisponibles();

    res.json(ejemplares);
  } catch (error) {
    console.error("Error al consultar ejemplares disponibles:", error.message);

    res.status(500).json({
      error: "No se pudieron obtener los ejemplares disponibles.",
    });
  }
});

// Comprobar que el usuario tiene una sesión válida
app.get("/api/catalogo/verificar-sesion", verificarToken, (req, res) => {
  res.json({
    mensaje: "Sesión válida.",
    usuario: {
      id: req.usuarioAuth.id,
    },
  });
});
// Comprobar permisos de bibliotecario
app.get(
  "/api/catalogo/verificar-bibliotecario",
  verificarToken,
  verificarBibliotecario,
  (req, res) => {
    res.json({
      mensaje: "Acceso autorizado para bibliotecario.",
    });
  },
);

// Registrar un nuevo libro
app.post(
  "/api/catalogo/libros",
  verificarToken,
  verificarBibliotecario,
  async (req, res) => {
    try {
      const libro = await registrarNuevoLibro(req.body, req.token);

      return res.status(201).json({
        mensaje: "Libro registrado correctamente.",
        libro,
      });
    } catch (error) {
      console.error("Error al registrar libro:", error.message);

      if (
        error.message === "Completa correctamente todos los campos." ||
        error.message === "El ISBN no puede superar 30 caracteres." ||
        error.message === "Ya existe un libro registrado con ese ISBN."
      ) {
        return res.status(400).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "No se pudo registrar el libro.",
      });
    }
  },
);

// Editar la información de un libro
app.put(
  "/api/catalogo/libros/:id",
  verificarToken,
  verificarBibliotecario,
  async (req, res) => {
    try {
      const libro = await editarLibro(req.params.id, req.body, req.token);

      return res.status(200).json({
        mensaje: "Libro actualizado correctamente.",
        libro,
      });
    } catch (error) {
      console.error("Error al actualizar libro:", error.message);

      if (
        error.message === "El libro seleccionado no es válido." ||
        error.message === "Completa correctamente todos los campos." ||
        error.message === "El ISBN no puede superar 30 caracteres." ||
        error.message === "Ya existe otro libro registrado con ese ISBN."
      ) {
        return res.status(400).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "No se pudo actualizar el libro.",
      });
    }
  },
);

// Eliminar un libro de forma segura
app.delete(
  "/api/catalogo/libros/:id",
  verificarToken,
  verificarBibliotecario,
  async (req, res) => {
    try {
      const libro = await eliminarLibroSeguro(req.params.id, req.token);

      return res.status(200).json({
        mensaje: "Libro eliminado correctamente.",
        libro,
      });
    } catch (error) {
      console.error("Error al eliminar libro:", error.message);

      if (
        error.message === "El libro seleccionado no es válido." ||
        error.message ===
          "No se puede eliminar el libro porque tiene ejemplares registrados." ||
        error.message ===
          "No se puede eliminar el libro porque tiene registros relacionados."
      ) {
        return res.status(400).json({
          error: error.message,
        });
      }

      return res.status(500).json({
        error: "No se pudo eliminar el libro.",
      });
    }
  },
);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(
    `Microservicio de Catálogo ejecutándose en http://localhost:${PORT}`,
  );
});
