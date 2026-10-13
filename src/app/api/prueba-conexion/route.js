import { crearClienteSupabaseServidor } from '@/lib/supabaseServer';

export async function GET() {
    try {
        const supabase = await crearClienteSupabaseServidor();

        const { data, error } = await supabase
            .from('usuarios')
            .select('id_usuario')
            .limit(1);

        if (error) {
            console.error('Error de Supabase:', error.message);

            return Response.json({
                conexion: false,
                mensaje: 'No se pudo consultar la tabla usuarios',
                detalle: error.message
            }, { status: 500 });
        }

        return Response.json({
            conexion: true,
            mensaje: 'Conexión con Supabase correcta',
            registrosConsultados: data.length
        });

    } catch (error) {
        console.error('Error de conexión:', error.message);

        return Response.json({
            conexion: false,
            mensaje: 'Error al conectar con Supabase'
        }, { status: 500 });
    }
}