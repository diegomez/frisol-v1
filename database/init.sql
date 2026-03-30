CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE tribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'csm', 'po', 'dev')),
  active BOOLEAN DEFAULT TRUE,
  tribe_id UUID REFERENCES tribes(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE SEQUENCE project_seq START WITH 1;

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_id VARCHAR(20) UNIQUE NOT NULL DEFAULT ('PRJ-' || LPAD(nextval('project_seq')::text, 5, '0')),
  csm_id UUID NOT NULL REFERENCES users(id),
  tribe_id UUID REFERENCES tribes(id),
  estado VARCHAR(20) NOT NULL DEFAULT 'en_progreso' CHECK (estado IN ('en_progreso', 'terminado', 'cerrado')),
  nombre_cliente VARCHAR(255),
  nombre_proyecto VARCHAR(255),
  crm_id VARCHAR(100),
  fecha_inicio DATE,
  interlocutores TEXT,
  evidencia TEXT,
  voz_dolor TEXT,
  impacto_negocio TEXT,
  terminado_by UUID REFERENCES users(id),
  terminado_at TIMESTAMP,
  cerrado_by UUID REFERENCES users(id),
  cerrado_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  what TEXT NOT NULL,
  who TEXT NOT NULL,
  when_field TEXT NOT NULL,
  where_field TEXT NOT NULL,
  how TEXT NOT NULL,
  declaration TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE causas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  why_1 TEXT NOT NULL,
  why_2 TEXT NOT NULL,
  why_3 TEXT NOT NULL,
  why_4 TEXT,
  why_5 TEXT,
  root_cause TEXT NOT NULL,
  origin_metodo BOOLEAN DEFAULT FALSE,
  origin_maquina BOOLEAN DEFAULT FALSE,
  origin_gobernanza BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  valor_actual VARCHAR(255) NOT NULL,
  valor_objetivo VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed tribes
INSERT INTO tribes (name) VALUES
  ('Retail'),
  ('Finance'),
  ('Telco'),
  ('Cross');

-- Seed users (bcrypt hash for "password123")
-- Default tribe for CSM is Retail
INSERT INTO users (email, password_hash, name, role, active, tribe_id) VALUES
  ('admin@frisol.com', '$2b$10$pwPHGHNTIE3.acbrKJHPFOE6u4ej/dBJUBlPVogNLzWLo2aEKhiUO', 'Admin Usuario', 'admin', TRUE, NULL),
  ('csm@frisol.com', '$2b$10$pwPHGHNTIE3.acbrKJHPFOE6u4ej/dBJUBlPVogNLzWLo2aEKhiUO', 'CSM Usuario', 'csm', TRUE, (SELECT id FROM tribes WHERE name = 'Retail')),
  ('po@frisol.com', '$2b$10$pwPHGHNTIE3.acbrKJHPFOE6u4ej/dBJUBlPVogNLzWLo2aEKhiUO', 'PO Usuario', 'po', TRUE, NULL),
  ('dev@frisol.com', '$2b$10$pwPHGHNTIE3.acbrKJHPFOE6u4ej/dBJUBlPVogNLzWLo2aEKhiUO', 'Dev Usuario', 'dev', TRUE, NULL);
