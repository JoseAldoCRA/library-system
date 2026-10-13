
-- Sistema de Biblioteca
-- Estructura de la base de datos

-- 1. Categorias
CREATE TABLE public.categorias (
    id_categoria INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE
);

-- 2. Libros
CREATE TABLE public.libros (
    id_libro INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    isbn TEXT NOT NULL UNIQUE,
    titulo TEXT NOT NULL,
    autor TEXT NOT NULL,
    id_categoria INTEGER NOT NULL,

    CONSTRAINT libros_id_categoria_fkey
        FOREIGN KEY (id_categoria)
        REFERENCES public.categorias(id_categoria)
);

-- 3. Ejemplares
CREATE TABLE public.ejemplares (
    id_ejemplar INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_libro INTEGER NOT NULL,
    codigo TEXT NOT NULL UNIQUE,
    estado TEXT NOT NULL DEFAULT 'disponible',

    CONSTRAINT ejemplares_id_libro_fkey
        FOREIGN KEY (id_libro)
        REFERENCES public.libros(id_libro),

    CONSTRAINT ejemplares_estado_check
        CHECK (estado IN ('disponible', 'prestado', 'baja'))
);

-- 4. Usuarios
CREATE TABLE public.usuarios (
    id_usuario INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre TEXT NOT NULL,
    correo TEXT NOT NULL UNIQUE,
    rol TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'activo',
    auth_user_id UUID UNIQUE,

    CONSTRAINT usuarios_rol_check
        CHECK (rol IN ('estudiante', 'docente', 'bibliotecario')),

    CONSTRAINT usuarios_estado_check
        CHECK (estado IN ('activo', 'inactivo'))
);

-- 5. Prestamos
CREATE TABLE public.prestamos (
    id_prestamo INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_usuario INTEGER NOT NULL,
    id_ejemplar INTEGER NOT NULL,
    fecha_prestamo DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE NOT NULL,
    fecha_devolucion DATE,

    CONSTRAINT prestamos_id_usuario_fkey
        FOREIGN KEY (id_usuario)
        REFERENCES public.usuarios(id_usuario),

    CONSTRAINT prestamos_id_ejemplar_fkey
        FOREIGN KEY (id_ejemplar)
        REFERENCES public.ejemplares(id_ejemplar),

    CONSTRAINT prestamos_check
        CHECK (fecha_vencimiento >= fecha_prestamo),

    CONSTRAINT prestamos_check1
        CHECK (
            fecha_devolucion IS NULL
            OR fecha_devolucion >= fecha_prestamo
        )
);

-- 6. Sanciones
CREATE TABLE public.sanciones (
    id_sancion INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_prestamo INTEGER NOT NULL UNIQUE,
    dias_retraso INTEGER NOT NULL,
    monto NUMERIC NOT NULL,
    estado_pago TEXT NOT NULL DEFAULT 'pendiente',

    CONSTRAINT sanciones_id_prestamo_fkey
        FOREIGN KEY (id_prestamo)
        REFERENCES public.prestamos(id_prestamo),

    CONSTRAINT sanciones_dias_retraso_check
        CHECK (dias_retraso > 0),

    CONSTRAINT sanciones_monto_check
        CHECK (monto >= 0),

    CONSTRAINT sanciones_estado_pago_check
        CHECK (estado_pago IN ('pendiente', 'pagado'))
);

-- 7. Habilitar seguridad RLS
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.libros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejemplares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prestamos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sanciones ENABLE ROW LEVEL SECURITY;
