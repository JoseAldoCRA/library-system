import "server-only";
import { crearClienteSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function verificarBibliotecario(request) {
  const autorizacion = request.headers.get("authorization");

  if (!autorizacion || !autorizacion.startsWith("Bearer ")) {
    throw new Error("Debes iniciar sesión.");
  }

  const token = autorizacion.substring(7).trim();

  if (!token) {
    throw new Error("Debes iniciar sesión.");
  }

  const supabase = crearClienteSupabaseAdmin();

  // Verificar que el token pertenezca a un usuario real
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new Error("Tu sesión no es válida.");
  }

  // Comprobar que sea un bibliotecario activo
  const { data: perfil, error: errorPerfil } = await supabase
    .from("usuarios")
    .select("id_usuario, rol, estado")
    .eq("auth_user_id", data.user.id)
    .eq("rol", "bibliotecario")
    .eq("estado", "activo")
    .maybeSingle();

  if (errorPerfil) {
    console.error("Error de Supabase al consultar usuarios:", {
      codigo: errorPerfil.code,
      mensaje: errorPerfil.message,
      detalles: errorPerfil.details,
    });

    throw new Error("No se pudo verificar el usuario.");
  }

  if (!perfil) {
    throw new Error("No tienes permisos de bibliotecario.");
  }

  return perfil;
}
