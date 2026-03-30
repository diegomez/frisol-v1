export interface Kpi {
  id: string;
  project_id: string;
  nombre: string;
  valor_actual: string;
  valor_objetivo: string;
  created_at: string;
}

export interface CreateKpiDto {
  nombre: string;
  valor_actual: string;
  valor_objetivo: string;
}
