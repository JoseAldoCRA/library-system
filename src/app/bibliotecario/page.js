
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabaseClient";

export default function PanelBibliotecario() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function verificarUsuario() {
      const supabase = crearClienteSupabase();

      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/");
        return;
      }

      const { data: perfil, error: errorPerfil } = await supabase
        .from("usuarios")
        .select("nombre, rol, estado")
        .eq("auth_user_id", user.id)
        .single();

      if (
        errorPerfil ||
        !perfil ||
        perfil.rol !== "bibliotecario" ||
        perfil.estado !== "activo"
      ) {
        router.replace("/");
        return;
      }

      setNombre(perfil.nombre);
      setCargando(false);
    }

    verificarUsuario();
  }, [router]);

  async function cerrarSesion() {
    const supabase = crearClienteSupabase();
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (cargando) {
    return <main style={{ padding: "40px" }}>Verificando sesión...</main>;
  }

  return (
    <main style={{ padding: "40px", background: "#f1f5f9", minHeight: "100vh" }}>
      <div style={{
        background: "white",
        padding: "30px",
        borderRadius: "12px",
        maxWidth: "900px",
        margin: "auto"
      }}>
        <h1 style={{ color: "#194b78" }}>Sistema de Biblioteca</h1>

        <p style={{ marginTop: "15px", color: "#334155" }}>
          Bienvenido, {nombre}
        </p>

        <h2 style={{ marginTop: "35px", color: "#194b78" }}>
          Panel del bibliotecario
        </h2>

        <p style={{ marginTop: "15px", color: "#334155" }}>
          Desde aquí podrás administrar los libros,
          ejemplares, préstamos y devoluciones de la biblioteca.
        </p>

        <button
          onClick={cerrarSesion}
          style={{
            marginTop: "30px",
            background: "#194b78",
            color: "white",
            border: "none",
            padding: "12px 20px",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}
