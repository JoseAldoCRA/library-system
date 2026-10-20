
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabaseClient";
import TablaDevoluciones from "@/components/TablaDevoluciones";

import {
  LibraryBig,
  LayoutDashboard,
  BookOpen,
  BookCopy,
  Handshake,
  ClipboardCheck,
  Users,
  ChartColumn,
  ShieldAlert,
  LogOut,
  ArrowUpRight
} from "lucide-react";

import TablaLibros from "@/components/TablaLibros";
import FormularioLibro from "@/components/FormularioLibro";
import FormularioEjemplar from "@/components/FormularioEjemplar";
import FormularioEditarLibro from "@/components/FormularioEditarLibro";
import TablaEjemplares from "@/components/TablaEjemplares";
import FormularioPrestamo from "@/components/FormularioPrestamo";
import TablaPrestamos from "@/components/TablaPrestamos";
import TablaSanciones from "@/components/TablaSanciones";
import TablaUsuarios from "@/components/TablaUsuarios";
import FormularioRegistrarUsuario from "@/components/FormularioRegistrarUsuario";
import ReportesBiblioteca from "@/components/ReportesBiblioteca";

import styles from "./bibliotecario.module.css";

export default function PanelBibliotecario() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(true);
  const [seccion, setSeccion] = useState("inicio");
  const [actualizacionLibros, setActualizacionLibros] = useState(0);
  const [libroEditar, setLibroEditar] = useState(null);

  useEffect(() => {
    async function verificarUsuario() {
      const supabase = crearClienteSupabase();

      const {
        data: { user },
        error
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

  function actualizarDatos() {
    setActualizacionLibros((anterior) => anterior + 1);
  }

  function cambiarSeccion(nuevaSeccion) {
    setSeccion(nuevaSeccion);
    setLibroEditar(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const opciones = [
    { id: "inicio", nombre: "Inicio", icono: LayoutDashboard },
    { id: "libros", nombre: "Libros", icono: BookOpen },
    { id: "ejemplares", nombre: "Ejemplares", icono: BookCopy },
    { id: "prestamos", nombre: "Préstamos", icono: Handshake },
    { id: "devoluciones", nombre: "Devoluciones", icono: ClipboardCheck },
    { id: "usuarios", nombre: "Usuarios", icono: Users },
    { id: "sanciones", nombre: "Sanciones", icono: ShieldAlert },
    { id: "reportes", nombre: "Reportes", icono: ChartColumn }
  ];

  const tituloActual = opciones.find(
    (opcion) => opcion.id === seccion
  )?.nombre;

  if (cargando) {
    return (
      <main className={styles.cargando}>
        Verificando sesión...
      </main>
    );
  }

  return (
    <div className={styles.panel} translate="no">

      { }

      <aside className={styles.sidebar}>
        <div className={styles.marca}>
          <LibraryBig size={32} strokeWidth={1.6} />

          <div>
            <strong>BIBLIOTECA</strong>
            <small>ADMINISTRACIÓN</small>
          </div>
        </div>

        <div className={styles.etiquetaMenu}>
          MENÚ PRINCIPAL
        </div>

        <nav className={styles.menu} aria-label="Administración">
          {opciones.map((opcion) => {
            const Icono = opcion.icono;

            return (
              <button
                type="button"
                key={opcion.id}
                className={
                  seccion === opcion.id
                    ? styles.opcionActiva
                    : styles.opcionMenu
                }
                aria-current={
                  seccion === opcion.id ? "page" : undefined
                }
                onClick={() => cambiarSeccion(opcion.id)}
              >
                <Icono size={20} />
                {opcion.nombre}
              </button>
            );
          })}
        </nav>

        <div className={styles.menuInferior}>
          <button
            type="button"
            className={styles.opcionMenu}
            onClick={() => router.push("/")}
          >
            <ArrowUpRight size={20} />
            Explorar catálogo
          </button>

          <button
            type="button"
            className={styles.opcionMenu}
            onClick={cerrarSesion}
          >
            <LogOut size={20} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      { }

      <main className={styles.contenido}>

        <header className={styles.encabezado}>
          <div>
            <span className={styles.subtitulo}>
              PANEL ADMINISTRATIVO
            </span>
            <h1>{seccion === "inicio" ? "Panel de control" : tituloActual}</h1>
            <p>Bienvenido, {nombre}</p>
          </div>

          <div className={styles.usuario}>
            <Users size={21} />
            <span>Bibliotecario</span>
          </div>
        </header>

        {/* INICIO */}

        {seccion === "inicio" && (
          <>
            <div className={styles.bienvenida}>
              <h2>Administración de la biblioteca</h2>
              <p>
                Gestiona los libros, préstamos, usuarios y demás
                servicios desde un solo lugar.
              </p>
            </div>

            <div className={styles.tarjetasInicio}>
              {opciones
                .filter((opcion) => opcion.id !== "inicio")
                .map((opcion) => {
                  const Icono = opcion.icono;

                  return (
                    <button
                      type="button"
                      key={opcion.id}
                      className={styles.tarjetaAcceso}
                      onClick={() => cambiarSeccion(opcion.id)}
                    >
                      <div className={styles.iconoAcceso}>
                        <Icono size={26} />
                      </div>

                      <strong>{opcion.nombre}</strong>
                      <span>Administrar sección</span>
                      <ArrowUpRight size={18} />
                    </button>
                  );
                })}
            </div>
          </>
        )}

        {/* LIBROS */}

        {seccion === "libros" && (
          <div className={styles.seccion}>
            <FormularioLibro alRegistrar={actualizarDatos} />

            <TablaLibros
              actualizacion={actualizacionLibros}
              alEditar={(libro) => setLibroEditar(libro)}
            />

            {libroEditar && (
              <FormularioEditarLibro
                key={libroEditar.id_libro}
                libro={libroEditar}
                alGuardar={() => {
                  setLibroEditar(null);
                  actualizarDatos();
                }}
                alCancelar={() => setLibroEditar(null)}
              />
            )}
          </div>
        )}

        {/* EJEMPLARES */}

        {seccion === "ejemplares" && (
          <div className={styles.seccion}>
            <FormularioEjemplar alRegistrar={actualizarDatos} />

            <TablaEjemplares
              actualizacion={actualizacionLibros}
              alCambiarEstado={actualizarDatos}
            />
          </div>
        )}

        {/* PRÉSTAMOS */}

        {seccion === "prestamos" && (
          <div className={styles.seccion}>
            <FormularioPrestamo
              actualizacion={actualizacionLibros}
              alRegistrar={actualizarDatos}
            />

            <TablaPrestamos
              actualizacion={actualizacionLibros}
              alDevolver={actualizarDatos}
            />
          </div>
        )}

        {/* DEVOLUCIONES */}

        {seccion === "devoluciones" && (
          <div className={styles.seccion}>
            <TablaDevoluciones
              actualizacion={actualizacionLibros}
            />
          </div>
        )}

        {/* USUARIOS */}

        {seccion === "usuarios" && (
          <div className={styles.seccion}>
            <FormularioRegistrarUsuario alRegistrar={actualizarDatos} />

            <TablaUsuarios actualizacion={actualizacionLibros} />
          </div>
        )}

        {/* SANCIONES */}

        {seccion === "sanciones" && (
          <div className={styles.seccion}>
            <TablaSanciones actualizacion={actualizacionLibros} />
          </div>
        )}

        {/* REPORTES */}

        {seccion === "reportes" && (
          <div className={styles.seccion}>
            <ReportesBiblioteca actualizacion={actualizacionLibros} />
          </div>
        )}

      </main>
    </div>
  );
}
