
const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !clave) {
  console.log("Faltan las variables de Supabase.");
  process.exit(1);
}

const supabase = createClient(url, clave);

// Primera prueba: solamente Libro de prueba
const idLibro = 1;
const rutaImagen = "libros/1.jpg";

async function actualizarPortada() {
  const { data: libro, error } = await supabase
    .from("libros")
    .select("id_libro, titulo, portada_url")
    .eq("id_libro", idLibro)
    .single();

  if (error || !libro) {
    console.log("No se pudo consultar el libro:", error?.message);
    return;
  }

  if (libro.titulo !== "Libro de prueba") {
    console.log("El libro no corresponde al registro de prueba.");
    return;
  }

  const { data } = supabase.storage
    .from("portadas-libros")
    .getPublicUrl(rutaImagen);

  const nuevaUrl = data.publicUrl;

  console.log("Libro:", libro.titulo);
  console.log("Portada actual:", libro.portada_url);
  console.log("Nueva portada:", nuevaUrl);

  // Evitar modificar datos accidentalmente
  if (process.argv[2] !== "--confirmar") {
    console.log("\nMODO PRUEBA: No se modificó Supabase.");
    return;
  }

  const { data: actualizado, error: errorUpdate } = await supabase
    .from("libros")
    .update({ portada_url: nuevaUrl })
    .eq("id_libro", idLibro)
    .eq("titulo", "Libro de prueba")
    .select("id_libro, titulo, portada_url")
    .single();

  if (errorUpdate) {
    console.log("Error al actualizar:", errorUpdate.message);
    return;
  }

  console.log("\nPortada actualizada correctamente.");
  console.log("Resultado:", actualizado);
}

actualizarPortada().catch(console.error);
