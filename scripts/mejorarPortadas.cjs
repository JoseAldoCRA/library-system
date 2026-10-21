
const fs = require("fs");

const libros = JSON.parse(
  fs.readFileSync("reportes/portadas-candidatas.json", "utf8")
);

// Primera prueba: dos libros
const idsRevisar = [16, 84];

function normalizar(texto = "") {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function esperar() {
  return new Promise(resolve => setTimeout(resolve, 1200));
}

async function buscarOpciones(libro) {
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
    throw new Error("Búsqueda HTTP " + respuesta.status);
  }

  const datos = await respuesta.json();
  const opciones = [];
  const vistas = new Set();

  for (const obra of datos.docs || []) {
    if (!obra.key?.startsWith("/works/")) continue;

    const autores = obra.author_name || [];
    const autorCorrecto = autores.some(autor =>
      normalizar(autor).includes(normalizar(libro.autor)) ||
      normalizar(libro.autor).includes(normalizar(autor))
    );

    if (!autorCorrecto) continue;

    await esperar();

    const respuestaEdiciones = await fetch(
      `https://openlibrary.org${obra.key}/editions.json?limit=300`
    );

    if (!respuestaEdiciones.ok) continue;

    const ediciones = await respuestaEdiciones.json();

    for (const edicion of ediciones.entries || []) {
      const titulo = normalizar(edicion.title);
      const tituloBuscado = normalizar(libro.titulo);

      const idiomas = (edicion.languages || [])
        .map(item => item.key);

      const portadaId = edicion.covers?.[0];

      // Preferir títulos exactos y ediciones registradas en español
      if (
        titulo === tituloBuscado &&
        idiomas.includes("/languages/spa") &&
        portadaId > 0 &&
        !vistas.has(portadaId)
      ) {
        vistas.add(portadaId);

        opciones.push({
          titulo: edicion.title,
          cover_id: portadaId,
          portada_url:
            `https://covers.openlibrary.org/b/id/${portadaId}-L.jpg`
        });
      }
    }
  }

  return opciones.slice(0, 5);
}

function escapar(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function iniciar() {
  const resultados = [];

  for (const id of idsRevisar) {
    const libro = libros.find(item => Number(item.id_libro) === id);

    if (!libro) continue;

    console.log("\nBuscando:", libro.titulo);

    try {
      const opciones = await buscarOpciones(libro);

      console.log("Alternativas encontradas:", opciones.length);

      resultados.push({
        id_libro: id,
        titulo: libro.titulo,
        autor: libro.autor,
        opciones
      });
    } catch (error) {
      console.log("Error:", error.message);
    }

    await esperar();
  }

  const tarjetas = resultados.map(libro => `
    <section>
      <h2>${escapar(libro.titulo)}</h2>
      <p>${escapar(libro.autor)} — ID: ${libro.id_libro}</p>
      <div class="grid">
        ${libro.opciones.map((opcion, i) => `
          <article>
            <img src="${escapar(opcion.portada_url)}"
                 alt="Portada candidata"
                 loading="lazy">
            <h3>Opción ${i + 1}</h3>
            <p>${escapar(opcion.titulo)}</p>
            <small>Cover ID: ${opcion.cover_id}</small>
          </article>
        `).join("") || "<p>Sin alternativas disponibles.</p>"}
      </div>
    </section>
  `).join("");

  const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Mejores portadas</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 30px;
        background: #f7f7f3;
        color: #234b3c;
      }
      section { margin-bottom: 45px; }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
        gap: 16px;
      }
      article {
        background: white;
        border: 1px solid #ddd;
        border-radius: 10px;
        padding: 14px;
      }
      img {
        width: 100%;
        height: 250px;
        object-fit: contain;
        background: #eff1ec;
      }
      h3 { font-size: 16px; }
      small { color: #666; }
    </style>
  </head>
  <body>
    <h1>Alternativas de portadas en español</h1>
    <p>Resultados pendientes de revisión visual.</p>
    ${tarjetas}
  </body>
  </html>`;

  fs.writeFileSync(
    "reportes/mejores-portadas.html",
    html,
    "utf8"
  );

  fs.writeFileSync(
    "reportes/mejores-portadas.json",
    JSON.stringify(resultados, null, 2),
    "utf8"
  );

  console.log("\nReporte generado correctamente.");
  console.log("No se modificó Supabase.");
}

iniciar().catch(console.error);
