const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

function escapar(texto) {
  return String(texto ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function buscar() {
  const { data: libros, error } = await supabase
    .from("libros")
    .select("id_libro, titulo, autor")
    .is("portada_url", null)
    .order("id_libro")
    .limit(5);

  if (error) {
    console.log("Error de Supabase:", error.message);
    return;
  }

  let tarjetas = "";
  let total = 0;

  for (const libro of libros) {
    console.log("Buscando:", libro.titulo);

    const parametros = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: `${libro.titulo} ${libro.autor}`,
      gsrnamespace: "6",
      gsrlimit: "6",
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "240",
      format: "json",
    });

    try {
      const respuesta = await fetch(
        "https://commons.wikimedia.org/w/api.php?" + parametros,
      );

      if (!respuesta.ok) {
        throw new Error("HTTP " + respuesta.status);
      }

      const datos = await respuesta.json();
      const archivos = Object.values(datos.query?.pages || {});

      for (const archivo of archivos) {
        // Solo archivos de imagen, no PDF
        if (!/\.(jpg|jpeg|png|webp)$/i.test(archivo.title)) {
          continue;
        }

        const info = archivo.imageinfo?.[0];

        if (!info?.descriptionurl || !info?.thumburl) {
          continue;
        }

        const licencia =
          info.extmetadata?.LicenseShortName?.value || "Sin información";

        tarjetas += `
          <div class="tarjeta">
            <img src="${escapar(info.thumburl)}" alt="Imagen candidata">
            <h3>${escapar(libro.titulo)}</h3>
            <p>${escapar(libro.autor)}</p>
            <small>ID del libro: ${libro.id_libro}</small>
            <p class="archivo">${escapar(archivo.title)}</p>
            <p>Licencia informada: ${escapar(licencia)}</p>
            <a href="${escapar(info.descriptionurl)}"
               target="_blank" rel="noopener noreferrer">
              Revisar en Wikimedia Commons
            </a>
          </div>
        `;

        total++;
      }
    } catch (errorBusqueda) {
      console.log("Error:", errorBusqueda.message);
    }
  }

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Revisión de portadas Wikimedia Commons</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: #f7f7f3;
          padding: 30px;
          color: #244d3d;
        }
        .contenedor {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 20px;
        }
        .tarjeta {
          background: white;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 15px;
        }
        img {
          display: block;
          height: 220px;
          max-width: 100%;
          object-fit: contain;
          margin: 0 auto 15px;
        }
        h3 { margin-bottom: 5px; }
        small, .archivo {
          color: #666;
          overflow-wrap: anywhere;
        }
        a { color: #245c47; }
      </style>
    </head>
    <body>
      <h1>Portadas candidatas de Wikimedia Commons</h1>
      <p>${total} imágenes encontradas para revisión.</p>
      <p>Estas imágenes no están aprobadas ni guardadas en Supabase.</p>
      <div class="contenedor">${tarjetas}</div>
    </body>
    </html>
  `;

  fs.mkdirSync("reportes", { recursive: true });

  fs.writeFileSync("reportes/portadas-commons.html", html, "utf8");

  console.log("\nImágenes candidatas:", total);
  console.log("Reporte creado: reportes/portadas-commons.html");
  console.log("No se modificó Supabase.");
}

buscar().catch(console.error);
