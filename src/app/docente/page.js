"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabaseClient";
import TablaMisPrestamos from "@/components/TablaMisPrestamos";

export default function PanelDocente(){
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function verificarUsuario() {
      const supabase = crearClienteSupabase();

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

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
        perfil.rol !== "docente"  ||
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
    return (
      <main style={{ padding: "40px" }}>
        Verificando sesión...
      </main>
    );
  }

  return (
    <main
      style={{
        padding: "40px 20px",
        background: "#f1f5f9",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          maxWidth: "900px",
          margin: "auto",
        }}
      >
        <h1 style={{ color: "#194b78" }}>
          Sistema de Biblioteca
        </h1>

        <p style={{ marginTop: "15px", color: "#334155" }}>
          Bienvenido, {nombre}
        </p>

        <h2 style={{ marginTop: "30px", color: "#194b78" }}>
          Panel del docente
        </h2>

        <p style={{ marginTop: "15px", color: "#334155" }}>
          Desde aquí podrás consultar tus préstamos,
          fechas de vencimiento y sanciones.
        </p>

        <div
          style={{
            background: "#eff6ff",
            padding: "20px",
            borderRadius: "10px",
            marginTop: "25px",
          }}
        >
          <h3 style={{ color: "#194b78" }}>
            Información de préstamos
          </h3>

          <p style={{ marginTop: "10px", color: "#334155" }}>
           Como docente puedes tener un máximo de 5 préstamos activos
          </p>
        </div>

        <TablaMisPrestamos/>

        <button
          onClick={cerrarSesion}
          style={{
            marginTop: "30px",
            padding: "12px 20px",
            background: "#194b78",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </main>
  );
}
