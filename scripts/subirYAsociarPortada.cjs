
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const idLibro = Number(process.argv[2]);
const archivoLocal = process.argv[3];
const confirmar = process.argv[4] === "--confirmar";

if (!Number.isInteger(idLibro) || idLibro <= 0 || !archivoLocal) {
  console.log("Uso: node scripts/subirYAsociarPortada.cjs ID_LIBRO ARCHIVO");
  process.exit(1);
}

const tipos = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

const extension = path.extname(archivoLocal).toLowerCase();
const tipo = tipos[extension];

if (!tipo || !fs.existsSync(archivoLocal)) {
  console.log("El archivo no existe o su formato no es válido.");
  process.exit(1);
}

const imagen = fs.readFileSync(archivoLocal);

function detectarTipoImagen(archivo) {
  // Comprobar si realmente es JPG
  if (
    archivo.length >= 3 &&
    archivo[0] === 0xFF &&
    archivo[1] === 0xD8 &&
    archivo[2] === 0xFF
  ) {
    return "image/jpeg";
  }

  // Comprobar si realmente es PNG
  if (
    archivo.length >= 8 &&
    archivo.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    )
  ) {
    return "image/png";
  }

  // Comprobar si realmente es WebP
  if (
    archivo.length >= 12 &&
    archivo.toString("ascii", 0, 4) === "RIFF" &&
    archivo.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

const tipoReal = detectarTipoImagen(imagen);

if (tipoReal !== tipo) {
  console.log("Error: el archivo no es una imagen válida del formato indicado.");
  process.exit(1);
}

if (imagen.length === 0 || imagen.length > 2 * 1024 * 1024) {
  console.log("La imagen debe tener un tamaño máximo de 2 MB.");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !clave) {
  console.log("Faltan las variables de Supabase.");
  process.exit(1);
}

const supabase = createClient(url, clave);

const bucket = "portadas-libros";
const extensionFinal = extension === ".jpeg" ? ".jpg" : extension;
const destino = `libros/${idLibro}${extensionFinal}`;

async function ejecutar() {
  const { data: libro, error } = await supabase
    .from("libros")
    .select("id_libro, titulo, portada_url")
    .eq("id_libro", idLibro)
    .single();

  if (error || !libro) {
    console.log("No se encontró el libro:", error?.message);
    return;
  }

  console.log("\nLibro:", libro.titulo);
  console.log("Archivo local:", archivoLocal);
  console.log("Destino en Storage:", destino);

  // No reemplazar portadas existentes
  if (libro.portada_url) {
    console.log("\nEste libro ya tiene una portada.");
    console.log("Portada actual:", libro.portada_url);
    console.log("No se modificó nada para evitar reemplazarla.");
    return;
  }
  
  // Comprobar si el archivo ya existe en Storage
  const nombreArchivo = `${idLibro}${extensionFinal}`;

  const { data: archivos, error: errorLista } =
    await supabase.storage
      .from(bucket)
      .list("libros", {
        limit: 100,
        search: nombreArchivo
      });

  if (errorLista) {
    console.log("Error al revisar Storage:", errorLista.message);
    return;
  }

  const yaExiste = archivos.some(
    (archivo) => archivo.name === nombreArchivo
  );

  if (yaExiste) {
    console.log("\nLa imagen ya existe en Supabase Storage.");
    console.log("Archivo:", destino);
    console.log("No se modificó nada.");
    return;
  }

  console.log("Destino disponible en Storage.");

  if (!confirmar) {
    console.log("\nMODO PRUEBA.");
    console.log("La imagen se podría subir y asociar a este libro.");
    console.log("No se modificó Supabase.");
    return;
  }

  const { error: errorSubida } = await supabase.storage
    .from(bucket)
    .upload(destino, imagen, {
      contentType: tipo,
      upsert: false
    });

  if (errorSubida) {
    console.log("Error al subir:", errorSubida.message);
    return;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(destino);

  const { data: actualizado, error: errorUpdate } = await supabase
    .from("libros")
    .update({ portada_url: data.publicUrl })
    .eq("id_libro", idLibro)
    .is("portada_url", null)
    .select("id_libro, titulo, portada_url")
    .single();

  if (errorUpdate) {
    console.log("No se pudo asociar la portada:", errorUpdate.message);
    console.log("La imagen subida quedó en Storage para revisión.");
    return;
  }

  console.log("\nPortada subida y asociada correctamente.");
  console.log("Libro:", actualizado.titulo);
  console.log("URL:", actualizado.portada_url);
}

ejecutar().catch(console.error);
