
import { crearClienteSupabaseServidor } from '@/lib/supabaseServer';

export async function GET() {
    try {
        const supabase = await crearClienteSupabaseServidor();

        const { error } = await supabase.auth.getSession();

        if (error) {
            return Response.json({
                conexion: false,
                mensaje: 'Error al consultar Supabase Auth',
                detalle: error.message
            }, { status: 500 });
        }

        return Response.json({
            conexion: true,
            mensaje: 'Comunicación con Supabase Auth correcta'
        });

    } catch (error) {
        return Response.json({
            conexion: false,
            mensaje: 'Error en la configuración de Supabase',
            detalle: error.message
        }, { status: 500 });
    }
}
