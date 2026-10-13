export function validarCredenciales(correo, contrasena) {

    if (!correo.trim() || !contrasena) {
        return 'Debes ingresar correo y contraseña';
    }

    if (!correo.includes('@')) {
        return 'Debes ingresar un correo válido';
    }

    return 'Formulario válido. La conexión con Supabase está pendiente.';
}
