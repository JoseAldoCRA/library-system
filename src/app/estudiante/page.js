import { Suspense } from "react";
import EstudianteContenido from "./EstudianteContenido";

export default function EstudiantePage() {
  return (
    <Suspense fallback={<p>Cargando panel de estudiante...</p>}>
      <EstudianteContenido />
    </Suspense>
  );
}
