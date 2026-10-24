import { Suspense } from "react";
import DocenteContenido from "./DocenteContenido";

export default function DocentePage() {
  return (
    <Suspense fallback={<p>Cargando panel de docente...</p>}>
      <DocenteContenido />
    </Suspense>
  );
}
