const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Faltan variables de entorno de Supabase.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function normalizarTexto(texto = "") {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function coincideLibro(libro, item) {
  const tituloLibro = normalizarTexto(libro.titulo);
  const autorLibro = normalizarTexto(libro.autor);

  const tituloOpen = normalizarTexto(item.title || "");
  const autorOpen = normalizarTexto(item.author_name?.[0] || "");

  const tituloCoincide =
    tituloOpen.includes(tituloLibro) || tituloLibro.includes(tituloOpen);

  const autorCoincide =
    autorOpen.includes(autorLibro) || autorLibro.includes(autorOpen);

  return tituloCoincide && autorCoincide && item.cover_i;
}

async function buscarCoincidencia(libro) {
  const params = new URLSearchParams({
    title: libro.titulo,
    author: libro.autor,
    limit: "10"
  });

  const url = `https://openlibrary.org/search.json?${params.toString()}`;
  const respuesta = await fetch(url);

  if (!respuesta.ok) {
    throw new Error(`HTTP ${respuesta.status}`);
  }

  const datos = await respuesta.json();
  const docs = datos.docs || [];

  const coincidencia = docs.find((item) => coincideLibro(libro, item));

  if (!coincidencia) {
    return null;
  }

  return {
    cover_id: coincidencia.cover_i,
    portada_url: `https://covers.openlibrary.org/b/id/${coincidencia.cover_i}-L.jpg`
  };
}

async function buscarPortadas() {
  const { data: libros, error } = await supabase
    .from("libros")
    .select("id_libro, titulo, autor, portada_url")
    .is("portada_url", null)
    .order("id_libro", { ascending: true });

  if (error) {
    console.error("Error de Supabase:", error.message);
    return;
  }

  console.log(`Libros que vamos a revisar: ${libros.length}`);

  const resultados = [];
  let encontradas = 0;
  let sinCoincidencia = 0;
  let errores = 0;

  for (const libro of libros) {
    console.log(`\nLibro: ${libro.titulo}`);
    console.log(`Autor: ${libro.autor}`);

    try {
      const coincidencia = await buscarCoincidencia(libro);

      if (coincidencia) {
        console.log("Portada candidata:", coincidencia.portada_url);

        resultados.push({
          id_libro: libro.id_libro,
          titulo: libro.titulo,
          autor: libro.autor,
          estado: "encontrada",
          cover_id: coincidencia.cover_id,
          portada_url: coincidencia.portada_url
        });

        encontradas++;
      } else {
        console.log("Sin coincidencia confiable.");

        resultados.push({
          id_libro: libro.id_libro,
          titulo: libro.titulo,
          autor: libro.autor,
          estado: "sin_coincidencia",
          cover_id: "",
          portada_url: ""
        });

        sinCoincidencia++;
      }
    } catch (errorBusqueda) {
      console.log("Error en la búsqueda:", errorBusqueda.message);

      resultados.push({
        id_libro: libro.id_libro,
        titulo: libro.titulo,
        autor: libro.autor,
        estado: "error",
        cover_id: "",
        portada_url: "",
        detalle_error: errorBusqueda.message
      });

      errores++;
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));
  }

  const carpetaReportes = path.join(process.cwd(), "reportes");
  fs.mkdirSync(carpetaReportes, { recursive: true });

  const rutaJson = path.join(carpetaReportes, "portadas-candidatas.json");
  fs.writeFileSync(rutaJson, JSON.stringify(resultados, null, 2), "utf8");

  const encabezadoCsv = "id_libro,titulo,autor,estado,cover_id,portada_url";
  const filasCsv = resultados.map((item) => {
    const titulo = `"${String(item.titulo || "").replace(/"/g, '""')}"`;
    const autor = `"${String(item.autor || "").replace(/"/g, '""')}"`;
    const estado = item.estado || "";
    const coverId = item.cover_id || "";
    const portadaUrl = `"${String(item.portada_url || "").replace(/"/g, '""')}"`;

    return [
      item.id_libro,
      titulo,
      autor,
      estado,
      coverId,
      portadaUrl
    ].join(",");
  });

  const rutaCsv = path.join(carpetaReportes, "portadas-candidatas.csv");
  fs.writeFileSync(rutaCsv, [encabezadoCsv, ...filasCsv].join("\n"), "utf8");

  console.log("\n======================================");
  console.log("Proceso terminado.");
  console.log("Portadas encontradas:", encontradas);
  console.log("Sin coincidencia:", sinCoincidencia);
  console.log("Errores:", errores);
  console.log("Reporte JSON:", rutaJson);
  console.log("Reporte CSV:", rutaCsv);
  console.log("No se modificó Supabase.");
  console.log("======================================");
}

buscarPortadas();