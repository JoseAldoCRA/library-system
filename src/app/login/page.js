import { Suspense } from "react";
import LoginContenido from "./LoginContenido";

export default function LoginPage() {
  return (
    <Suspense fallback={<p>Cargando inicio de sesión...</p>}>
      <LoginContenido />
    </Suspense>
  );
}
