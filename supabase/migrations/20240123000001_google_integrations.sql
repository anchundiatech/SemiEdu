-- Crear tabla para almacenar integraciones de Google Classroom
CREATE TABLE IF NOT EXISTS google_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    google_user_id TEXT NOT NULL,
    google_email TEXT NOT NULL,
    google_name TEXT,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para optimizar consultas
    UNIQUE(user_id),
    UNIQUE(google_user_id)
);

-- Agregar campos de Google Classroom a las tablas existentes
ALTER TABLE clases ADD COLUMN IF NOT EXISTS google_classroom_id TEXT UNIQUE;
ALTER TABLE clases ADD COLUMN IF NOT EXISTS codigo_acceso TEXT;
ALTER TABLE clases ADD COLUMN IF NOT EXISTS enlace_classroom TEXT;
ALTER TABLE clases ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP WITH TIME ZONE;
ALTER TABLE clases ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP WITH TIME ZONE;

ALTER TABLE tareas ADD COLUMN IF NOT EXISTS google_classroom_id TEXT UNIQUE;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS puntos_maximos INTEGER;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS tipo TEXT;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS enlace_classroom TEXT;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP WITH TIME ZONE;
ALTER TABLE tareas ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP WITH TIME ZONE;

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS foto_url TEXT;

-- Políticas RLS para google_integrations
ALTER TABLE google_integrations ENABLE ROW LEVEL SECURITY;

-- Solo los coordinadores pueden gestionar integraciones
CREATE POLICY "Coordinadores pueden gestionar integraciones" ON google_integrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'rol' = 'coordinador'
        )
    );

-- Función para actualizar timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_google_integrations_updated_at 
    BEFORE UPDATE ON google_integrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Índices adicionales para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_clases_google_classroom_id ON clases(google_classroom_id);
CREATE INDEX IF NOT EXISTS idx_tareas_google_classroom_id ON tareas(google_classroom_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_google_id ON usuarios(google_id);
CREATE INDEX IF NOT EXISTS idx_google_integrations_user_id ON google_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_google_integrations_google_user_id ON google_integrations(google_user_id);
