
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

const libros = [
  ["El perfume", "el_perfume.jpg"],
  ["Harry Potter y la cámara secreta", "harry_potter_camara_secreta.jpg"],
  ["Ficciones", "ficciones.jpg"],
  ["Rimas y leyendas", "rimas_y_leyendas.jpg"],
  ["Todo se desmorona", "todo_se_desmorona.jpg"],
  ["A sangre fría", "a_sangre_fria.jpg"],
  ["La isla del tesoro", "la_isla_del_tesoro.jpg"],
  ["Emma", "emma.jpg"],
  ["El rey Lear", "el_rey_lear.jpg"],
  ["Pasaje a la India", "pasaje_a_la_india.jpg"],
  ["El corazón es un cazador solitario", "el_corazon_es_un_cazador_solitario.jpg"],
  ["El corazón de las tinieblas", "el_corazon_de_las_tinieblas.jpg"],
  ["Tormenta de espadas", "tormenta_de_espadas.jpg"],
  ["David Copperfield", "david_copperfield.jpg"],
  ["La isla de los amores infinitos", "la_isla_de_los_amores_infinitos.jpg"],
  ["Progreso del peregrino", "progreso_del_peregrino.jpg"],
  ["Robinson Crusoe", "robinson_crusoe.jpg"],
  ["La catedral del mar", "la_catedral_del_mar.jpg"],
  ["Juego de tronos", "juego_de_tronos.jpg"]
];

async function generarLote() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from("libros")
    .select("id_libro, titulo")
    .in("titulo", libros.map(libro => libro[0]));

  if (error) {
    console.log("Error de Supabase:", error.message);
    return;
  }

  const lote = [];
  let problemas = 0;

  for (const [titulo, nombre] of libros) {
    const encontrados = data.filter(libro => libro.titulo === titulo);
    const archivo = `portadas-locales/${nombre}`;

    if (encontrados.length !== 1) {
      console.log("No se encontró un libro único:", titulo);
      problemas++;
      continue;
    }

    if (!fs.existsSync(archivo)) {
      console.log("FALTA:", archivo);
      problemas++;
      continue;
    }

    const tamaño = fs.statSync(archivo).size;

    if (tamaño === 0 || tamaño > 2 * 1024 * 1024) {
      console.log("Tamaño no permitido:", archivo);
      problemas++;
      continue;
    }

    lote.push({
      idLibro: encontrados[0].id_libro,
      archivo
    });

    console.log("OK:", encontrados[0].id_libro, titulo);
  }

  if (problemas > 0 || lote.length !== 19) {
    console.log("Hay problemas. No se modificó el JSON.");
    return;
  }

  const destino = "portadas-locales/lote-portadas.json";

  if (fs.existsSync(destino)) {
    fs.copyFileSync(destino, destino + ".bak");
  }

  fs.writeFileSync(destino, JSON.stringify(lote, null, 2));

  console.log("\nLote creado correctamente.");
  console.log("Total:", lote.length);
  console.log("No se modificó Supabase.");
}

generarLote().catch(console.error);
