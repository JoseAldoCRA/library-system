"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import estilos from "@/app/catalogo.module.css";

export default function SelectorPrestamo({
  id,
  valor,
  alCambiar,
  opciones,
  textoInicial,
  textoBusqueda,
  deshabilitado = false,
  mostrarBuscador = true,
}) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const selectorRef = useRef(null);
  const buscadorRef = useRef(null);

  const opcionSeleccionada = opciones.find(
    (item) => String(item.valor) === String(valor),
  );

  const coincidencias = opciones.filter((item) =>
    item.texto.toLowerCase().includes(busqueda.trim().toLowerCase()),
  );

  // Mostrar hasta 50 resultados para mantener rápida la lista.
  const resultadosVisibles = coincidencias.slice(0, 50);

  useEffect(() => {
    if (!abierto) return;

    buscadorRef.current?.focus();

    function cerrarAlHacerClicFuera(evento) {
      if (selectorRef.current && !selectorRef.current.contains(evento.target)) {
        setAbierto(false);
        setBusqueda("");
      }
    }

    function cerrarConEscape(evento) {
      if (evento.key === "Escape") {
        setAbierto(false);
        setBusqueda("");
      }
    }

    document.addEventListener("mousedown", cerrarAlHacerClicFuera);
    document.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.removeEventListener("mousedown", cerrarAlHacerClicFuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [abierto]);

  function seleccionar(item) {
    alCambiar(String(item.valor));
    setAbierto(false);
    setBusqueda("");
  }

  return (
    <div
      ref={selectorRef}
      className={estilos.filtroCategoriaModerno}
      style={{ width: "100%", marginLeft: 0 }}
    >
      <button
        id={id}
        type="button"
        className={estilos.botonFiltroCategorias}
        style={{
          height: "49px",
          minHeight: "49px",
          padding: "0 16px",
          boxSizing: "border-box",
        }}
        aria-expanded={abierto}
        aria-controls={`${id}-lista`}
        disabled={deshabilitado}
        onClick={() => {
          setAbierto(!abierto);
          setBusqueda("");
        }}
      >
        <SlidersHorizontal size={19} />

        <span
          title={opcionSeleccionada?.texto || textoInicial}
          style={{
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {opcionSeleccionada?.texto || textoInicial}
        </span>

        <span className={estilos.flechaCategoria}>{abierto ? "⌃" : "⌄"}</span>
      </button>

      {abierto && (
        <div id={`${id}-lista`} className={estilos.panelCategorias}>
          {mostrarBuscador && (
            <input
              ref={buscadorRef}
              type="search"
              className={estilos.buscarCategoria}
              placeholder={textoBusqueda}
              aria-label={textoBusqueda}
              value={busqueda}
              onChange={(evento) => setBusqueda(evento.target.value)}
            />
          )}

          <div className={estilos.listaCategorias}>
            {resultadosVisibles.length > 0 ? (
              resultadosVisibles.map((item) => (
                <button
                  key={item.valor}
                  type="button"
                  className={[
                    estilos.opcionCategoria,
                    String(valor) === String(item.valor)
                      ? estilos.categoriaActiva
                      : "",
                  ].join(" ")}
                  onClick={() => seleccionar(item)}
                >
                  <span>{item.texto}</span>

                  {String(valor) === String(item.valor) && <span>✓</span>}
                </button>
              ))
            ) : (
              <p className={estilos.sinCategorias}>
                No se encontraron resultados.
              </p>
            )}
          </div>

          <div className={estilos.pieCategorias}>
            {coincidencias.length > 50
              ? `Mostrando 50 de ${coincidencias.length}. Escribe para buscar.`
              : `${coincidencias.length} resultados encontrados`}
          </div>
        </div>
      )}
    </div>
  );
}
