
const fs = require("fs");
const path = require("path");

const carpeta = path.join(process.cwd(), "reportes");
const archivoJson = path.join(carpeta, "portadas-candidatas.json");
const archivoHtml = path.join(carpeta, "revision-portadas.html");

if (!fs.existsSync(archivoJson)) {
  console.log("No se encontró el reporte de portadas.");
  process.exit(1);
}

const libros = JSON.parse(fs.readFileSync(archivoJson, "utf8"));
const encontrados = libros.filter(
  (libro) => libro.estado === "encontrada" && libro.portada_url
);

function escapar(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const tarjetas = encontrados.map((libro) => `
  <article class="tarjeta">
    <div class="imagen">
      <img
        src="${escapar(libro.portada_url)}"
        alt="Portada candidata de ${escapar(libro.titulo)}"
        loading="lazy"
      >
    </div>
    <div class="datos">
      <strong>${escapar(libro.titulo)}</strong>
      <p>${escapar(libro.autor)}</p>
      <small>ID del libro: ${escapar(libro.id_libro)}</small>
      <a href="${escapar(libro.portada_url)}" target="_blank" rel="noopener noreferrer">
        Abrir imagen
      </a>
    </div>
  </article>
`).join("");

const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Revisión de portadas</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f7f7f3;
      color: #213d33;
      margin: 0;
      padding: 30px;
    }
    h1 { margin-bottom: 8px; }
    .descripcion { color: #666; margin-bottom: 30px; }
    .contenedor {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 20px;
    }
    .tarjeta {
      background: white;
      border: 1px solid #e0e5df;
      border-radius: 12px;
      overflow: hidden;
    }
    .imagen {
      height: 270px;
      background: #eff1ec;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
    }
    .imagen img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .datos { padding: 16px; }
    .datos strong { display: block; }
    .datos p { color: #666; font-size: 14px; }
    .datos small { display: block; color: #888; }
    .datos a {
      display: inline-block;
      margin-top: 12px;
      color: #245c47;
    }
  </style>
</head>
<body>
  <h1>Revisión de portadas</h1>
  <p class="descripcion">
    ${encontrados.length} portadas candidatas de Open Library.
    Estas imágenes todavía no han sido aprobadas ni guardadas en Supabase.
  </p>
  <div class="contenedor">${tarjetas}</div>
</body>
</html>
`;

fs.writeFileSync(archivoHtml, html, "utf8");

console.log("Página de revisión creada:");
console.log(archivoHtml);
console.log("Portadas candidatas:", encontrados.length);
console.log("No se modificó Supabase.");
