import { crearClienteSupabase } from '@/lib/supabaseClient';

export async function iniciarSesion(correo, contrasena) {
    const supabase = crearClienteSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({
        email: correo,
        password: contrasena
    });

    if (error) {
        return {
            exito: false,
            mensaje: 'Correo o contraseña incorrectos'
        };
    }

    const { data: perfil, error: errorPerfil } = await supabase
        .from('usuarios')
        .select('id_usuario, nombre, correo, rol, estado')
        .eq('auth_user_id', data.user.id)
        .single();

    if (errorPerfil || !perfil || perfil.estado !== 'activo') {
        await supabase.auth.signOut();

        return {
            exito: false,
            mensaje: 'Tu usuario no tiene un perfil activo'
        };
    }

    return {
        exito: true,
        usuario: perfil
    };
}
