
const fs = require("fs");
const path = require("path");

const idLibro = Number(process.argv[2]);
const coverId = Number(process.argv[3]);

if (!Number.isInteger(idLibro) || idLibro <= 0 ||
    !Number.isInteger(coverId) || coverId <= 0) {
  console.log("Uso: node scripts/guardarPortada.cjs ID_LIBRO COVER_ID");
  process.exit(1);
}

const carpeta = path.join(process.cwd(), "reportes");

const rutaCandidatas = path.join(carpeta, "portadas-candidatas.json");
const rutaAprobadas = path.join(carpeta, "portadas-aprobadas.json");

if (!fs.existsSync(rutaCandidatas)) {
  console.log("No se encontró el reporte de libros.");
  process.exit(1);
}

const candidatas = JSON.parse(
  fs.readFileSync(rutaCandidatas, "utf8")
);

const libro = candidatas.find(
  item => Number(item.id_libro) === idLibro
);

if (!libro) {
  console.log("No se encontró ese ID de libro.");
  process.exit(1);
}

let aprobadas = [];

if (fs.existsSync(rutaAprobadas)) {
  aprobadas = JSON.parse(
    fs.readFileSync(rutaAprobadas, "utf8")
  );
}

const seleccion = {
  id_libro: libro.id_libro,
  titulo: libro.titulo,
  autor: libro.autor,
  cover_id: coverId,
  portada_url: `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`,
  estado: "aprobada_visualmente"
};

const posicion = aprobadas.findIndex(
  item => Number(item.id_libro) === idLibro
);

if (posicion >= 0) {
  aprobadas[posicion] = seleccion;
  console.log("Se actualizó la selección existente.");
} else {
  aprobadas.push(seleccion);
  console.log("Se agregó una nueva selección.");
}

fs.writeFileSync(
  rutaAprobadas,
  JSON.stringify(aprobadas, null, 2),
  "utf8"
);

console.log("\nLibro:", seleccion.titulo);
console.log("Portada:", seleccion.portada_url);
console.log("Total de portadas aprobadas:", aprobadas.length);
console.log("No se modificó Supabase.");
