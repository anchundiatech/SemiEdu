-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('estudiante', 'docente', 'coordinador')) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clases
CREATE TABLE clases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    codigo_clase VARCHAR(50) UNIQUE NOT NULL,
    id_usuario UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tareas
CREATE TABLE tareas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clase_id UUID REFERENCES clases(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_entrega TIMESTAMP WITH TIME ZONE NOT NULL,
    estado VARCHAR(20) CHECK (estado IN ('activa', 'vencida', 'completada')) DEFAULT 'activa',
    puntos_maximos INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de entregas de tareas
CREATE TABLE entregas_tareas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tarea_id UUID REFERENCES tareas(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    contenido TEXT,
    archivo_url TEXT,
    calificacion INTEGER CHECK (calificacion >= 0 AND calificacion <= 100),
    comentarios TEXT,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'entregada', 'calificada')) DEFAULT 'pendiente',
    fecha_entrega TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tarea_id, usuario_id)
);

-- Tabla de notificaciones
CREATE TABLE notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(20) CHECK (tipo IN ('tarea', 'calendario', 'calificacion', 'anuncio')) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    prioridad VARCHAR(10) CHECK (prioridad IN ('alta', 'media', 'baja')) DEFAULT 'media',
    leida BOOLEAN DEFAULT FALSE,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de progreso
CREATE TABLE progreso (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    clase_id UUID REFERENCES clases(id) ON DELETE CASCADE,
    nota_promedio DECIMAL(5,2) DEFAULT 0,
    asistencia DECIMAL(5,2) DEFAULT 0,
    tareas_completadas INTEGER DEFAULT 0,
    tareas_totales INTEGER DEFAULT 0,
    ultimo_acceso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, clase_id)
);

-- Tabla de inscripciones (relación muchos a muchos entre usuarios y clases)
CREATE TABLE inscripciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    clase_id UUID REFERENCES clases(id) ON DELETE CASCADE,
    fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado VARCHAR(20) CHECK (estado IN ('activa', 'inactiva', 'completada')) DEFAULT 'activa',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, clase_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
CREATE INDEX idx_clases_usuario ON clases(id_usuario);
CREATE INDEX idx_tareas_clase ON tareas(clase_id);
CREATE INDEX idx_tareas_fecha_entrega ON tareas(fecha_entrega);
CREATE INDEX idx_entregas_tarea ON entregas_tareas(tarea_id);
CREATE INDEX idx_entregas_usuario ON entregas_tareas(usuario_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_fecha ON notificaciones(fecha);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_progreso_usuario ON progreso(usuario_id);
CREATE INDEX idx_progreso_clase ON progreso(clase_id);
CREATE INDEX idx_inscripciones_usuario ON inscripciones(usuario_id);
CREATE INDEX idx_inscripciones_clase ON inscripciones(clase_id);

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clases_updated_at BEFORE UPDATE ON clases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tareas_updated_at BEFORE UPDATE ON tareas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entregas_tareas_updated_at BEFORE UPDATE ON entregas_tareas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progreso_updated_at BEFORE UPDATE ON progreso
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Vista para obtener el progreso de estudiantes con información adicional
CREATE VIEW vista_progreso_estudiantes AS
SELECT 
    p.usuario_id,
    u.nombre as nombre_usuario,
    u.email,
    p.clase_id,
    c.nombre as nombre_clase,
    p.nota_promedio,
    p.asistencia,
    CASE 
        WHEN p.tareas_totales > 0 THEN 
            (p.tareas_completadas::decimal / p.tareas_totales::decimal * 100)
        ELSE 0 
    END as progreso_general
FROM progreso p
JOIN usuarios u ON p.usuario_id = u.id
JOIN clases c ON p.clase_id = c.id
WHERE u.rol = 'estudiante';

-- Función para calcular el progreso de un estudiante
CREATE OR REPLACE FUNCTION calcular_progreso_estudiante(
    p_usuario_id UUID,
    p_clase_id UUID
) RETURNS DECIMAL AS $$
DECLARE
    total_tareas INTEGER;
    tareas_completadas INTEGER;
    nota_promedio DECIMAL;
    progreso_final DECIMAL;
BEGIN
    -- Contar total de tareas de la clase
    SELECT COUNT(*) INTO total_tareas
    FROM tareas 
    WHERE clase_id = p_clase_id;
    
    -- Contar tareas completadas por el estudiante
    SELECT COUNT(*) INTO tareas_completadas
    FROM entregas_tareas et
    JOIN tareas t ON et.tarea_id = t.id
    WHERE et.usuario_id = p_usuario_id 
    AND t.clase_id = p_clase_id 
    AND et.estado IN ('entregada', 'calificada');
    
    -- Calcular nota promedio
    SELECT COALESCE(AVG(et.calificacion), 0) INTO nota_promedio
    FROM entregas_tareas et
    JOIN tareas t ON et.tarea_id = t.id
    WHERE et.usuario_id = p_usuario_id 
    AND t.clase_id = p_clase_id 
    AND et.calificacion IS NOT NULL;
    
    -- Calcular progreso final (promedio de nota y porcentaje de tareas completadas)
    IF total_tareas > 0 THEN
        progreso_final := (nota_promedio + (tareas_completadas::decimal / total_tareas::decimal * 100)) / 2;
    ELSE
        progreso_final := nota_promedio;
    END IF;
    
    -- Actualizar tabla de progreso
    INSERT INTO progreso (usuario_id, clase_id, nota_promedio, tareas_completadas, tareas_totales)
    VALUES (p_usuario_id, p_clase_id, nota_promedio, tareas_completadas, total_tareas)
    ON CONFLICT (usuario_id, clase_id) 
    DO UPDATE SET 
        nota_promedio = EXCLUDED.nota_promedio,
        tareas_completadas = EXCLUDED.tareas_completadas,
        tareas_totales = EXCLUDED.tareas_totales,
        updated_at = NOW();
    
    RETURN progreso_final;
END;
$$ LANGUAGE plpgsql;

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas_tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE progreso ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Los usuarios pueden ver su propia información" ON usuarios
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Los usuarios pueden actualizar su propia información" ON usuarios
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Políticas para clases
CREATE POLICY "Los docentes pueden ver sus clases" ON clases
    FOR SELECT USING (
        auth.uid()::text = id_usuario::text OR
        EXISTS (
            SELECT 1 FROM inscripciones i 
            WHERE i.clase_id = clases.id 
            AND i.usuario_id::text = auth.uid()::text
        )
    );

-- Políticas para notificaciones
CREATE POLICY "Los usuarios pueden ver sus notificaciones" ON notificaciones
    FOR SELECT USING (auth.uid()::text = usuario_id::text);

CREATE POLICY "Los usuarios pueden actualizar sus notificaciones" ON notificaciones
    FOR UPDATE USING (auth.uid()::text = usuario_id::text);
