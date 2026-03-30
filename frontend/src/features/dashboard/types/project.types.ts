export interface Project {
  id: string;
  internal_id: string | null;
  nombre_cliente: string | null;
  nombre_proyecto: string | null;
  crm_id: string | null;
  fecha_inicio: string | null;
  estado: 'en_progreso' | 'terminado' | 'cerrado';
  csm_name: string;
  csm_id: string;
  tribe_id: string | null;
  tribe_name: string | null;
  progress: ProjectProgress | null;
  created_at: string;
  updated_at: string;
}

export type ProgressStatus = 'red' | 'yellow' | 'green';

export interface ProjectProgress {
  cliente: ProgressStatus;
  diagnostico: ProgressStatus;
  evidencia: ProgressStatus;
  vozDolor: ProgressStatus;
  causas: ProgressStatus;
  impacto: ProgressStatus;
}
