
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const idLibro = Number(process.argv[2]);
const archivoLocal = process.argv[3];

if (!Number.isInteger(idLibro) || idLibro <= 0 || !archivoLocal) {
  console.log("Uso: node scripts/subirPortada.cjs ID_LIBRO ARCHIVO");
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

if (imagen.length === 0 || imagen.length > 2 * 1024 * 1024) {
  console.log("La imagen debe tener un tamaño de hasta 2 MB.");
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

async function subirPortada() {
  console.log("Libro ID:", idLibro);
  console.log("Archivo:", archivoLocal);
  console.log("Destino:", destino);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(destino, imagen, {
      contentType: tipo,
      upsert: false
    });

  if (error) {
    console.log("Error al subir:", error.message);
    return;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(destino);

  console.log("\nImagen subida correctamente.");
  console.log("URL pública:", data.publicUrl);
  console.log("No se modificó la tabla libros.");
}

subirPortada().catch(console.error);
