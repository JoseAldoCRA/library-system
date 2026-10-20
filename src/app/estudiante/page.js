
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabaseClient";

import TablaMisPrestamos from "@/components/TablaMisPrestamos";
import TablaMisSanciones from "@/components/TablaMisSanciones";

import {
  LibraryBig,
  LayoutDashboard,
  BookOpen,
  ShieldAlert,
  Search,
  LogOut,
  GraduationCap,
  ArrowUpRight
} from "lucide-react";

import styles from "./estudiante.module.css";

export default function PanelEstudiante() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(true);
  const [seccion, setSeccion] = useState("inicio");

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
        perfil.rol !== "estudiante" ||
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

  const opciones = [
    { id: "inicio", nombre: "Inicio", icono: LayoutDashboard },
    { id: "prestamos", nombre: "Mis préstamos", icono: BookOpen },
    { id: "sanciones", nombre: "Mis sanciones", icono: ShieldAlert },
  ];

  function nombreSeccion() {
    if (seccion === "prestamos") return "Mis préstamos";
    if (seccion === "sanciones") return "Mis sanciones";
    return "Panel de control";
  }

  if (cargando) {
    return (
      <main className={styles.cargando}>
        Verificando sesión...
      </main>
    );
  }

  return (
    <div className={styles.panel} translate="no">

      {/* MENÚ LATERAL */}

      <aside className={styles.sidebar}>

        <div className={styles.marca}>
          <LibraryBig size={26} />

          <div>
            <strong>BIBLIOTECA</strong>
            <span>ESTUDIANTE</span>
          </div>
        </div>

        <p className={styles.etiquetaMenu}>
          MENÚ PRINCIPAL
        </p>

        <nav className={styles.menu}>
          {opciones.map((opcion) => {
            const Icono = opcion.icono;

            return (
              <button
                key={opcion.id}
                type="button"
                className={`${styles.opcion} ${
                  seccion === opcion.id
                    ? styles.opcionActiva
                    : ""
                }`}
                onClick={() => setSeccion(opcion.id)}
              >
                <Icono size={18} />
                {opcion.nombre}
              </button>
            );
          })}
        </nav>

        <div className={styles.pieSidebar}>
          <button
            type="button"
            className={styles.opcion}
            onClick={() => router.push("/")}
          >
            <Search size={18} />
            Explorar catálogo
          </button>

          <button
            type="button"
            className={styles.opcion}
            onClick={cerrarSesion}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}

      <main className={styles.contenido}>

        <header className={styles.encabezado}>
          <div>
            <span>PANEL DEL ESTUDIANTE</span>
            <h1>{nombreSeccion()}</h1>
            <p>Bienvenido, {nombre}</p>
          </div>

          <div className={styles.rol}>
            <GraduationCap size={18} />
            Estudiante
          </div>
        </header>

        {/* INICIO */}

        {seccion === "inicio" && (
          <div className={styles.seccion}>

            <div className={styles.bienvenida}>
              <h2>Mi biblioteca</h2>
              <p>
                Consulta tus préstamos, fechas de vencimiento
                y sanciones desde un solo lugar.
              </p>
            </div>

            <div className={styles.tarjetas}>

              <button
                type="button"
                className={styles.tarjeta}
                onClick={() => setSeccion("prestamos")}
              >
                <div className={styles.icono}>
                  <BookOpen size={23} />
                </div>

                <h3>Mis préstamos</h3>
                <p>
                  Consulta tus libros prestados y fechas de entrega.
                </p>
                <ArrowUpRight size={17} />
              </button>

              <button
                type="button"
                className={styles.tarjeta}
                onClick={() => setSeccion("sanciones")}
              >
                <div className={styles.icono}>
                  <ShieldAlert size={23} />
                </div>

                <h3>Mis sanciones</h3>
                <p>
                  Consulta las multas relacionadas con tus préstamos.
                </p>
                <ArrowUpRight size={17} />
              </button>

            </div>
          </div>
        )}

        {/* MIS PRÉSTAMOS */}

        {seccion === "prestamos" && (
          <div className={styles.seccion}>

            <div className={styles.aviso}>
              Como estudiante puedes tener un máximo
              de 3 préstamos activos.
            </div>

            <TablaMisPrestamos />
          </div>
        )}

        {/* MIS SANCIONES */}

        {seccion === "sanciones" && (
          <div className={styles.seccion}>
            <TablaMisSanciones />
          </div>
        )}

      </main>
    </div>
  );
}
