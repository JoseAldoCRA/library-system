
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { crearClienteSupabase } from "@/lib/supabaseClient";

import TablaMisPrestamos from "@/components/TablaMisPrestamos";
import TablaMisSolicitudes from "@/components/TablaMisSolicitudes";
import TablaMisSanciones from "@/components/TablaMisSanciones";
import { obtenerLibroPorId } from "@/repositories/librosRepository";
import { crearSolicitudPrestamo } from "@/repositories/solicitudesRepository";

import {
  LibraryBig,
  LayoutDashboard,
  BookOpen,
  ShieldAlert,
  Search,
  LogOut,
  GraduationCap,
  ArrowUpRight,
  ClipboardList
} from "lucide-react";

import styles from "./estudiante.module.css";

export default function PanelEstudiante() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const idLibroSeleccionado = searchParams.get("libro");

  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(true);
  const [seccion, setSeccion] = useState("inicio");
  const [libroSolicitud, setLibroSolicitud] = useState(null);
  const [cargandoLibro, setCargandoLibro] = useState(false);
  const [errorLibro, setErrorLibro] = useState("");
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);
  const [mensajeSolicitud, setMensajeSolicitud] = useState("");
  const [solicitudConfirmada, setSolicitudConfirmada] = useState(false);

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


  useEffect(() => {
    if (cargando || !idLibroSeleccionado) return;

    let activo = true;

    async function cargarLibro() {
      setCargandoLibro(true);
      setErrorLibro("");
      setLibroSolicitud(null);

      try {
        const id = Number(idLibroSeleccionado);

        if (!Number.isSafeInteger(id) || id <= 0) {
          throw new Error("El libro seleccionado no es válido.");
        }

        const libro = await obtenerLibroPorId(id);

        if (!libro) {
          throw new Error("No se encontró el libro seleccionado.");
        }

        if (activo) {
          setLibroSolicitud(libro);
          setSeccion("solicitud");
        }
      } catch (error) {
        if (activo) {
          setErrorLibro(error.message);
          setSeccion("solicitud");
        }
      } finally {
        if (activo) setCargandoLibro(false);
      }
    }

    cargarLibro();

    return () => {
      activo = false;
    };
  }, [idLibroSeleccionado, cargando]);


  async function confirmarSolicitud() {
    if (!libroSolicitud || enviandoSolicitud || solicitudConfirmada) {
      return;
    }

    const disponibles =
      libroSolicitud.ejemplares?.filter(
        (item) => item.estado === "disponible"
      ).length ?? 0;

    if (disponibles === 0) {
      setMensajeSolicitud("Este libro no tiene ejemplares disponibles.");
      return;
    }

    setEnviandoSolicitud(true);
    setMensajeSolicitud("");

    try {
      await crearSolicitudPrestamo(libroSolicitud.id_libro);

      setSolicitudConfirmada(true);
      setMensajeSolicitud(
        "Tu solicitud se registró correctamente. Está pendiente de revisión por el bibliotecario."
      );
    } catch (error) {
      setMensajeSolicitud(
        error.message || "No se pudo registrar la solicitud."
      );
    } finally {
      setEnviandoSolicitud(false);
    }
  }

  function cancelarSolicitud() {
    router.push("/");
  }



  async function cerrarSesion() {
    const supabase = crearClienteSupabase();

    await supabase.auth.signOut();

    router.replace("/");
  }

  const opciones = [
    { id: "inicio", nombre: "Inicio", icono: LayoutDashboard },
    { id: "solicitudes", nombre: "Mis solicitudes", icono: ClipboardList },
    { id: "prestamos", nombre: "Mis préstamos", icono: BookOpen },
    { id: "sanciones", nombre: "Mis sanciones", icono: ShieldAlert },
  ];

  function nombreSeccion() {
    if (seccion === "solicitud") return "Solicitar préstamo";
    if (seccion === "prestamos") return "Mis préstamos";
    if (seccion === "solicitudes") return "Mis solicitudes";
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
                className={`${styles.opcion} ${seccion === opcion.id
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


        {/* SOLICITUD DE PRÉSTAMO */}

        {seccion === "solicitud" && (
          <div className={styles.seccion}>
            <div className={styles.bienvenida}>
              <h2>Solicitud de préstamo</h2>
              <p>
                Revisa los datos del libro antes de solicitarlo.
              </p>
            </div>

            {cargandoLibro && (
              <p>Cargando información del libro...</p>
            )}

            {errorLibro && (
              <p role="alert" style={{ color: "#B42318" }}>
                Error: {errorLibro}
              </p>
            )}

            {!cargandoLibro && !errorLibro && libroSolicitud && (
              <div className={styles.detalleSolicitud}>
                <div className={styles.icono}>
                  <BookOpen size={25} />
                </div>

                <h2>{libroSolicitud.titulo}</h2>

                <p>
                  <strong>Autor:</strong> {libroSolicitud.autor}
                </p>

                <p>
                  <strong>ISBN:</strong> {libroSolicitud.isbn}
                </p>

                <p>
                  <strong>Categoría:</strong>{" "}
                  {libroSolicitud.categorias?.nombre || "Sin categoría"}
                </p>

                <p>
                  <strong>Ejemplares disponibles:</strong>{" "}
                  {libroSolicitud.ejemplares?.filter(
                    (item) => item.estado === "disponible"
                  ).length ?? 0}
                </p>


                <div style={{ display: "flex", gap: "12px", marginTop: "20px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={cancelarSolicitud}
                    disabled={enviandoSolicitud}
                    style={{
                      padding: "12px 20px",
                      border: "1px solid #D4DED5",
                      borderRadius: "10px",
                      background: "#FFFFFF",
                      color: "#244D3D",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {solicitudConfirmada ? "Volver al catálogo" : "Cancelar"}
                  </button>

                  <button
                    type="button"
                    onClick={confirmarSolicitud}
                    disabled={
                      enviandoSolicitud ||
                      solicitudConfirmada ||
                      (libroSolicitud.ejemplares?.filter(
                        (item) => item.estado === "disponible"
                      ).length ?? 0) === 0
                    }
                    className={styles.botonConfirmarSolicitud}
                  >
                    {enviandoSolicitud
                      ? "Enviando solicitud..."
                      : solicitudConfirmada
                        ? "Solicitud enviada"
                        : "Confirmar solicitud"}
                  </button>
                </div>

                {mensajeSolicitud && (
                  <p
                    role="status"
                    className={styles.avisoSolicitud}
                    style={{
                      color: solicitudConfirmada ? "#244D3D" : "#B42318",
                    }}
                  >
                    {mensajeSolicitud}
                  </p>
                )}

                {!solicitudConfirmada &&
                  (libroSolicitud.ejemplares?.filter(
                    (item) => item.estado === "disponible"
                  ).length ?? 0) === 0 && (
                    <p className={styles.avisoSolicitud}>
                      Este libro no tiene ejemplares disponibles.
                      Por el momento no puedes solicitarlo.
                    </p>
                  )}

              </div>
            )}
          </div>
        )}

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
                onClick={() => setSeccion("solicitudes")}
              >
                <div className={styles.icono}>
                  <ClipboardList size={23} />
                </div>

                <h3>Mis solicitudes</h3>

                <p>
                  Revisa el estado de tus solicitudes.
                </p>

                <ArrowUpRight size={17} />
              </button>

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
                  Consulta libros y vencimientos.
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
                  Consulta multas y restricciones.
                </p>
                <ArrowUpRight size={17} />
              </button>

            </div>
          </div>
        )}

        {/* MIS SOLICITUDES */}

        {seccion === "solicitudes" && (
          <div className={styles.seccion}>
            <div className={styles.bienvenida}>
              <h2>Mis solicitudes</h2>
              <p>
                Consulta el estado de los libros que has solicitado.
              </p>
            </div>

            <TablaMisSolicitudes />
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
