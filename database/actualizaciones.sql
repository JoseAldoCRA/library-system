-- Sistema de Biblioteca
-- Actualizaciones posteriores al esquema original
--
-- Este archivo documenta cambios ya aplicados en Supabase.
-- NO ejecutarlo nuevamente sobre la base de datos actual.

-- ============================================
-- 1. Tabla para activacion de usuarios
-- ============================================

CREATE TABLE IF NOT EXISTS public.activaciones_usuario (
    id_activacion BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    id_usuario INTEGER NOT NULL,

    codigo_hash TEXT NOT NULL UNIQUE,

    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    vence_en TIMESTAMPTZ NOT NULL,

    usado_en TIMESTAMPTZ,

    CONSTRAINT activaciones_usuario_id_usuario_fkey
        FOREIGN KEY (id_usuario)
        REFERENCES public.usuarios(id_usuario)
        ON DELETE CASCADE,

    CONSTRAINT activacion_fechas_validas
        CHECK (vence_en > creado_en)
);

-- Indice para buscar activaciones por usuario
CREATE INDEX IF NOT EXISTS idx_activaciones_usuario
ON public.activaciones_usuario(id_usuario);

-- Habilitar seguridad
ALTER TABLE public.activaciones_usuario
ENABLE ROW LEVEL SECURITY;

-- Impedir el acceso directo desde el cliente.
-- Las operaciones administrativas se gestionan
-- desde rutas protegidas del servidor.
REVOKE ALL ON TABLE public.activaciones_usuario
FROM PUBLIC, anon, authenticated;

-- ============================================
-- 2. Seguridad de la tabla usuarios
-- ============================================

-- El bibliotecario puede consultar los usuarios
CREATE POLICY "bibliotecario_consultar_usuarios"
ON public.usuarios
FOR SELECT
TO authenticated
USING ((SELECT public.es_bibliotecario()));


-- Cada usuario puede consultar su propio perfil
CREATE POLICY "usuarios_ver_perfil_propio"
ON public.usuarios
FOR SELECT
TO authenticated
USING (auth_user_id = (SELECT auth.uid()));


-- El bibliotecario puede registrar usuarios
CREATE POLICY "bibliotecario_registrar_usuarios"
ON public.usuarios
FOR INSERT
TO authenticated
WITH CHECK ((SELECT public.es_bibliotecario()));


-- El bibliotecario puede actualizar usuarios
CREATE POLICY "bibliotecario_actualizar_usuarios"
ON public.usuarios
FOR UPDATE
TO authenticated
USING ((SELECT public.es_bibliotecario()))
WITH CHECK ((SELECT public.es_bibliotecario()));


-- Permitir consultar usuarios desde la aplicación
GRANT SELECT
ON TABLE public.usuarios
TO authenticated;

-- Permitir al servidor actualizar los datos
-- administrables de estudiantes y docentes
GRANT UPDATE (nombre, correo, rol, estado)
ON TABLE public.usuarios
TO service_role;


-- Permitir consultar usuarios desde operaciones
-- administrativas del servidor
GRANT SELECT
ON TABLE public.usuarios
TO service_role;

-- ============================================
-- 3. Creacion automatica de perfiles de usuario
-- ============================================

-- Esta funcion se ejecuta cuando se crea
-- una cuenta nueva en Supabase Auth.

CREATE OR REPLACE FUNCTION public.crear_perfil_usuario_auth()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$

DECLARE
    v_nombre text;
    v_rol text;

BEGIN

    -- Obtener los datos del registro
    v_nombre = NEW.raw_user_meta_data ->> 'nombre';
    v_rol = NEW.raw_user_meta_data ->> 'rol';

    -- Validar nombre
    IF v_nombre IS NULL OR trim(v_nombre) = '' THEN
        RAISE EXCEPTION 'Debes ingresar un nombre.';
    END IF;

    -- Validar rol
    IF v_rol IS NULL OR v_rol NOT IN ('estudiante', 'docente') THEN
        RAISE EXCEPTION 'El rol seleccionado no está permitido.';
    END IF;

    -- Evitar registrar una cuenta para un correo
    -- que ya pertenece a un usuario de la biblioteca
    IF EXISTS (
        SELECT 1
        FROM public.usuarios
        WHERE lower(correo) = lower(NEW.email)
    ) THEN
        RAISE EXCEPTION
            'Este correo ya está registrado. Solicita su activación al bibliotecario.';
    END IF;

    -- Crear el perfil de un usuario nuevo
    INSERT INTO public.usuarios (
        nombre,
        correo,
        rol,
        estado,
        auth_user_id
    )
    VALUES (
        trim(v_nombre),
        lower(NEW.email),
        v_rol,
        'activo',
        NEW.id
    );

    RETURN NEW;

END;
$function$;


-- Ejecutar la funcion cuando se registre
-- una cuenta nueva en Supabase Auth.

CREATE TRIGGER crear_perfil_despues_registro
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.crear_perfil_usuario_auth();


-- ============================================
-- 4. Prestamos, devoluciones y sanciones
-- ============================================

-- 4.1 Registrar prestamo

CREATE OR REPLACE FUNCTION public.registrar_prestamo(
    p_id_usuario integer,
    p_id_ejemplar integer,
    p_fecha_vencimiento date
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_estado_usuario text;
    v_rol_usuario text;
    v_estado_ejemplar text;
    v_id_prestamo integer;
BEGIN
    -- Comprobar que quien realiza la operación es bibliotecario
    IF NOT public.es_bibliotecario() THEN
        RAISE EXCEPTION 'No tienes permiso para registrar préstamos.';
    END IF;

    -- Validar la fecha de vencimiento
    IF p_fecha_vencimiento IS NULL
       OR p_fecha_vencimiento < CURRENT_DATE THEN
        RAISE EXCEPTION 'La fecha de vencimiento no es válida.';
    END IF;

    -- Consultar al usuario
    SELECT estado, rol
    INTO v_estado_usuario, v_rol_usuario
    FROM public.usuarios
    WHERE id_usuario = p_id_usuario;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El usuario no existe.';
    END IF;

    IF v_estado_usuario <> 'activo' THEN
        RAISE EXCEPTION 'El usuario está inactivo.';
    END IF;

    IF v_rol_usuario NOT IN ('estudiante', 'docente') THEN
        RAISE EXCEPTION 'Este usuario no puede recibir préstamos.';
    END IF;

    -- Consultar y bloquear el ejemplar durante la operación
    SELECT estado
    INTO v_estado_ejemplar
    FROM public.ejemplares
    WHERE id_ejemplar = p_id_ejemplar
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El ejemplar no existe.';
    END IF;

    IF v_estado_ejemplar <> 'disponible' THEN
        RAISE EXCEPTION 'El ejemplar no está disponible.';
    END IF;

    -- Evitar préstamos activos duplicados
    IF EXISTS (
        SELECT 1
        FROM public.prestamos
        WHERE id_ejemplar = p_id_ejemplar
          AND fecha_devolucion IS NULL
    ) THEN
        RAISE EXCEPTION 'El ejemplar ya tiene un préstamo activo.';
    END IF;

    -- Registrar el préstamo
    INSERT INTO public.prestamos (
        id_usuario,
        id_ejemplar,
        fecha_prestamo,
        fecha_vencimiento
    )
    VALUES (
        p_id_usuario,
        p_id_ejemplar,
        CURRENT_DATE,
        p_fecha_vencimiento
    )
    RETURNING id_prestamo INTO v_id_prestamo;

    -- Marcar el ejemplar como prestado
    UPDATE public.ejemplares
    SET estado = 'prestado'
    WHERE id_ejemplar = p_id_ejemplar;

    RETURN v_id_prestamo;
END;
$function$;


-- 4.2 Registrar devolucion

CREATE OR REPLACE FUNCTION public.registrar_devolucion(
    p_id_prestamo integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_id_ejemplar integer;
    v_fecha_vencimiento date;
    v_fecha_devolucion date;
    v_dias_retraso integer;
    v_monto numeric;
BEGIN
    -- Verificar que sea bibliotecario
    IF NOT public.es_bibliotecario() THEN
        RAISE EXCEPTION 'No tienes permiso para registrar devoluciones.';
    END IF;

    -- Buscar y bloquear el préstamo
    SELECT id_ejemplar, fecha_vencimiento, fecha_devolucion
    INTO v_id_ejemplar, v_fecha_vencimiento, v_fecha_devolucion
    FROM public.prestamos
    WHERE id_prestamo = p_id_prestamo
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El préstamo no existe.';
    END IF;

    -- Evitar devoluciones duplicadas
    IF v_fecha_devolucion IS NOT NULL THEN
        RAISE EXCEPTION 'Este préstamo ya fue devuelto.';
    END IF;

    -- Comprobar que el ejemplar esté prestado
    PERFORM 1
    FROM public.ejemplares
    WHERE id_ejemplar = v_id_ejemplar
      AND estado = 'prestado'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'El ejemplar no está marcado como prestado.';
    END IF;

    -- Calcular días de retraso
    v_dias_retraso = GREATEST(
        CURRENT_DATE - v_fecha_vencimiento,
        0
    );

    -- Registrar la devolución
    UPDATE public.prestamos
    SET fecha_devolucion = CURRENT_DATE
    WHERE id_prestamo = p_id_prestamo;

    -- Volver a poner el ejemplar disponible
    UPDATE public.ejemplares
    SET estado = 'disponible'
    WHERE id_ejemplar = v_id_ejemplar;

    -- Crear sanción solamente si existe retraso
    IF v_dias_retraso > 0 THEN

        v_monto = v_dias_retraso * 10;

        INSERT INTO public.sanciones (
            id_prestamo,
            dias_retraso,
            monto,
            estado_pago
        )
        VALUES (
            p_id_prestamo,
            v_dias_retraso,
            v_monto,
            'pendiente'
        );

    END IF;

END;
$function$;


-- 4.3 Registrar pago de sancion

CREATE OR REPLACE FUNCTION public.registrar_pago_sancion(
    p_id_sancion integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
    v_estado_pago text;
BEGIN

    -- Solo el bibliotecario puede registrar pagos
    IF NOT public.es_bibliotecario() THEN
        RAISE EXCEPTION 'No tienes permiso para registrar pagos.';
    END IF;

    -- Buscar y bloquear la sanción
    SELECT estado_pago
    INTO v_estado_pago
    FROM public.sanciones
    WHERE id_sancion = p_id_sancion
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'La sanción no existe.';
    END IF;

    -- Evitar registrar dos veces el mismo pago
    IF v_estado_pago = 'pagado' THEN
        RAISE EXCEPTION 'Esta multa ya fue pagada.';
    END IF;

    -- Registrar el pago
    UPDATE public.sanciones
    SET estado_pago = 'pagado'
    WHERE id_sancion = p_id_sancion;

END;
$function$;


-- ============================================
-- 5. Permisos de ejecucion de funciones
-- ============================================

-- Retirar permisos de ejecucion publicos
-- y de roles que no utilizan estas funciones.

REVOKE EXECUTE
ON FUNCTION public.registrar_prestamo(integer, integer, date)
FROM PUBLIC, anon, service_role;

REVOKE EXECUTE
ON FUNCTION public.registrar_devolucion(integer)
FROM PUBLIC, anon, service_role;

REVOKE EXECUTE
ON FUNCTION public.registrar_pago_sancion(integer)
FROM PUBLIC, anon, service_role;


-- Permitir que los usuarios autenticados
-- invoquen las funciones.
-- Cada funcion verifica internamente
-- que el usuario sea un bibliotecario activo.

GRANT EXECUTE
ON FUNCTION public.registrar_prestamo(integer, integer, date)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.registrar_devolucion(integer)
TO authenticated;

GRANT EXECUTE
ON FUNCTION public.registrar_pago_sancion(integer)
TO authenticated;

-- ============================================
-- 6. SEGURIDAD DE USUARIOS ACTIVOS
-- ============================================

-- Comprobar que el usuario autenticado
-- tenga un perfil activo

CREATE OR REPLACE FUNCTION public.es_usuario_activo()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.usuarios
        WHERE auth_user_id = (SELECT auth.uid())
        AND estado = 'activo'
        AND rol IN ('estudiante', 'docente', 'bibliotecario')
    );
$$;

-- Permitir ejecutar la función solo a usuarios autenticados

REVOKE ALL ON FUNCTION public.es_usuario_activo()
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.es_usuario_activo()
TO authenticated;


-- Restringir el acceso al catálogo
-- a usuarios que tengan un perfil activo

ALTER POLICY "catalogo_ver_categorias"
ON public.categorias
TO authenticated
USING ((SELECT public.es_usuario_activo()));

ALTER POLICY "catalogo_ver_libros"
ON public.libros
TO authenticated
USING ((SELECT public.es_usuario_activo()));

ALTER POLICY "catalogo_ver_ejemplares"
ON public.ejemplares
TO authenticated
USING ((SELECT public.es_usuario_activo()));