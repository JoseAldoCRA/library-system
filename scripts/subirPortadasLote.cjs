const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const confirmar = process.argv.includes("--confirmar");
const reemplazar = process.argv.includes("--reemplazar");

const rutaLote =
  process.argv.find((arg) => arg.endsWith(".json")) ||
  "portadas-locales/lote-portadas.json";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log("Faltan variables de entorno de Supabase.");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const bucket = "portadas-libros";

function detectarTipoYExtension(rutaArchivo) {
  const ext = path.extname(rutaArchivo).toLowerCase();

  if (ext === ".jpg" || ext === ".jpeg") {
    return { contentType: "image/jpeg", extensionFinal: ".jpg" };
  }

  if (ext === ".png") {
    return { contentType: "image/png", extensionFinal: ".png" };
  }

  if (ext === ".webp") {
    return { contentType: "image/webp", extensionFinal: ".webp" };
  }

  throw new Error(`Formato no soportado: ${ext}`);
}

async function procesarItem(item) {
  const idLibro = item.idLibro;
  const archivoLocal = item.archivo;

  console.log("\n----------------------------------------");
  console.log(`Libro ID: ${idLibro}`);
  console.log(`Archivo local: ${archivoLocal}`);

  if (!fs.existsSync(archivoLocal)) {
    console.log("No existe el archivo local. Se omite.");
    return;
  }

  const { data: libro, error: errorLibro } = await supabase
    .from("libros")
    .select("id_libro, titulo, portada_url")
    .eq("id_libro", idLibro)
    .single();

  if (errorLibro || !libro) {
    console.log("No se encontró el libro:", errorLibro?.message || "desconocido");
    return;
  }

  console.log(`Título: ${libro.titulo}`);

  if (libro.portada_url && !reemplazar) {
    console.log("Ya tiene portada. Se omite para no reemplazarla.");
    console.log("Portada actual:", libro.portada_url);
    return;
  }

  let tipo;
  try {
    tipo = detectarTipoYExtension(archivoLocal);
  } catch (error) {
    console.log(error.message);
    return;
  }

  const destino = `libros/${idLibro}${tipo.extensionFinal}`;
  console.log("Destino en Storage:", destino);

  if (!confirmar) {
    console.log("MODO PRUEBA. No se subió ni se actualizó Supabase.");
    return;
  }

  const buffer = fs.readFileSync(archivoLocal);

  const { error: errorSubida } = await supabase.storage
    .from(bucket)
    .upload(destino, buffer, {
      contentType: tipo.contentType,
      upsert: !!reemplazar
    });

  if (errorSubida) {
    console.log("Error al subir:", errorSubida.message);
    return;
  }

  const { data: dataPublica } = supabase.storage
    .from(bucket)
    .getPublicUrl(destino);

  const nuevaUrl = dataPublica.publicUrl;

  const { data: actualizado, error: errorUpdate } = await supabase
    .from("libros")
    .update({ portada_url: nuevaUrl })
    .eq("id_libro", idLibro)
    .select("id_libro, titulo, portada_url")
    .single();

  if (errorUpdate) {
    console.log("Se subió la imagen, pero no se pudo actualizar la tabla libros.");
    console.log("Error:", errorUpdate.message);
    return;
  }

  console.log("Portada subida y asociada correctamente.");
  console.log("Resultado:", actualizado);
}

async function ejecutar() {
  if (!fs.existsSync(rutaLote)) {
    console.log("No existe el archivo de lote:", rutaLote);
    return;
  }

  const contenido = fs.readFileSync(rutaLote, "utf8");
  const lote = JSON.parse(contenido);

  if (!Array.isArray(lote) || lote.length === 0) {
    console.log("El lote está vacío o no es válido.");
    return;
  }

  console.log(`Items en lote: ${lote.length}`);
  if (!confirmar) {
    console.log("Ejecutando en MODO PRUEBA...");
  }

  for (const item of lote) {
    await procesarItem(item);
  }

  console.log("\nProceso terminado.");
}

ejecutar().catch(console.error);