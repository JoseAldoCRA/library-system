
const { obtenerCategorias } = require("../repositories/catalogoRepository");

// Consultar las categorías de la biblioteca
async function listarCategorias() {
  return await obtenerCategorias();
}

module.exports = {
  listarCategorias
};
