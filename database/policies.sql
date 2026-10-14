-- Verificar si el usuario es un bibliotecario activo
CREATE OR REPLACE FUNCTION public.es_bibliotecario()
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
        AND rol = 'bibliotecario'
        AND estado = 'activo'
    );
$$;

-- Limitar quienes pueden ejecutar la funcion

REVOKE ALL ON FUNCTION public.es_bibliotecario() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.es_bibliotecario()
TO authenticated;


-- Permitir consultar categorias
CREATE POLICY "catalogo_ver_categorias"
ON public.categorias
FOR SELECT
TO authenticated
USING (true);

-- Permitir consultar libros
CREATE POLICY "catalogo_ver_libros"
ON public.libros
FOR SELECT
TO authenticated
USING (true);

-- Permitir consultar ejemplares
CREATE POLICY "catalogo_ver_ejemplares"
ON public.ejemplares
FOR SELECT
TO authenticated
USING (true);

-- Otorgar permiso de lectura
GRANT SELECT ON public.categorias TO authenticated;
GRANT SELECT ON public.libros TO authenticated;
GRANT SELECT ON public.ejemplares TO authenticated;


-- PASO 82.7: ADMINISTRACION DEL CATALOGO

-- Permisos de administracion de categorias

CREATE POLICY "bibliotecario_gestionar_categorias"
ON public.categorias
FOR ALL
TO authenticated
USING ((SELECT public.es_bibliotecario()))
WITH CHECK ((SELECT public.es_bibliotecario()));

-- Permisos de administracion de libros

CREATE POLICY "bibliotecario_gestionar_libros"
ON public.libros
FOR ALL
TO authenticated
USING ((SELECT public.es_bibliotecario()))
WITH CHECK ((SELECT public.es_bibliotecario()));

-- Permisos de administracion de ejemplares

CREATE POLICY "bibliotecario_gestionar_ejemplares"
ON public.ejemplares
FOR ALL
TO authenticated
USING ((SELECT public.es_bibliotecario()))
WITH CHECK ((SELECT public.es_bibliotecario()));

-- Permitir operaciones SQL
GRANT INSERT, UPDATE, DELETE
ON public.categorias, public.libros, public.ejemplares
TO authenticated;

-- Permitir el uso de los identificadores automaticos
GRANT USAGE
ON SEQUENCE public.categorias_id_categoria_seq,
            public.libros_id_libro_seq,
            public.ejemplares_id_ejemplar_seq
TO authenticated;

-- Retirar permisos que no utiliza la aplicacion

REVOKE TRUNCATE, TRIGGER, REFERENCES
ON TABLE
    public.categorias,
    public.libros,
    public.ejemplares
FROM anon, authenticated;