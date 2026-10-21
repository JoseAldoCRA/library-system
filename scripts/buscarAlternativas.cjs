
const fs = require("fs");

const libros = JSON.parse(
  fs.readFileSync("reportes/portadas-candidatas.json", "utf8")
);

// Probaremos con Cien años de soledad
// Recibir el ID del libro desde la terminal
const idLibro = Number(process.argv[2]);

if (!Number.isInteger(idLibro) || idLibro <= 0) {
  console.log("Uso: node scripts/buscarAlternativas.cjs ID_LIBRO");
  process.exit(1);
}

const libro = libros.find(
  (item) => Number(item.id_libro) === idLibro
);

async function buscarAlternativas() {
  if (!libro) {
    console.log("No se encontró el libro en el reporte.");
    return;
  }

  console.log("Buscando alternativas para:", libro.titulo);

  const parametros = new URLSearchParams({
    title: libro.titulo,
    author: libro.autor,
    limit: "3",
    fields: "key,title,author_name"
  });

  const respuesta = await fetch(
    "https://openlibrary.org/search.json?" + parametros
  );

  if (!respuesta.ok) {
    throw new Error("Error en la búsqueda: " + respuesta.status);
  }

  const datos = await respuesta.json();
  const alternativas = [];
  const portadasVistas = new Set();

  for (const obra of datos.docs || []) {
    if (!obra.key || !obra.key.startsWith("/works/")) {
      continue;
    }

    const respuestaEdiciones = await fetch(
      `https://openlibrary.org${obra.key}/editions.json?limit=300`
    );

    if (!respuestaEdiciones.ok) {
      console.log("No se pudieron consultar las ediciones.");
      continue;
    }

    const datosEdiciones = await respuestaEdiciones.json();

    for (const edicion of datosEdiciones.entries || []) {
      const idiomas = (edicion.languages || []).map(
        (idioma) => idioma.key
      );

      const esEspanol = idiomas.includes("/languages/spa");
      const portadaId = edicion.covers?.[0];

      if (
        esEspanol &&
        portadaId > 0 &&
        !portadasVistas.has(portadaId)
      ) {
        portadasVistas.add(portadaId);

        alternativas.push({
          titulo: edicion.title,
          portada: `https://covers.openlibrary.org/b/id/${portadaId}-L.jpg`,
          idioma: "Español"
        });
      }
    }
  }

  console.log("\nAlternativas encontradas:", alternativas.length);
  console.log("\nPrimeras alternativas:");

  console.log(alternativas.slice(0, 10));

    // Crear una página para revisar las portadas alternativas
  const escapar = (texto) =>
    String(texto || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const tarjetas = alternativas.map((item, indice) => `
    <div class="tarjeta">
      <div class="imagen">
        <img src="${escapar(item.portada)}" alt="Portada alternativa">
      </div>
      <h3>Opción ${indice + 1}</h3>
      <p>${escapar(item.titulo)}</p>
      <small>Idioma registrado: ${escapar(item.idioma)}</small>
      <a href="${escapar(item.portada)}" target="_blank">
        Ver imagen completa
      </a>
    </div>
  `).join("");

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Alternativas de portadas</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f7f7f3;
          padding: 30px;
          color: #234b3c;
        }
        .contenedor {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
          gap: 20px;
        }
        .tarjeta {
          background: white;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 12px;
        }
        .imagen {
          height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eff1ec;
        }
        img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        h3 { margin-bottom: 6px; }
        small { display: block; color: #777; }
        a {
          display: block;
          margin-top: 12px;
          color: #245c47;
        }
      </style>
    </head>
    <body>
      <h1>Alternativas para ${escapar(libro.titulo)}</h1>
      <p>${alternativas.length} portadas encontradas. Todavía no se ha seleccionado ninguna.</p>
      <div class="contenedor">${tarjetas}</div>
    </body>
    </html>
  `;

  fs.writeFileSync(
    `reportes/alternativas-libro-${idLibro}.html`,
    html,
    "utf8"
  );

  console.log("\nPágina de alternativas creada correctamente.");

  console.log("\nNo se modificó Supabase ni el reporte anterior.");
}

buscarAlternativas().catch((error) => {
  console.log("Error:", error.message);
});
