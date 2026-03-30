export interface Causa {
  id: string;
  project_id: string;
  why_1: string;
  why_2: string;
  why_3: string;
  why_4: string | null;
  why_5: string | null;
  root_cause: string;
  origin_metodo: boolean;
  origin_maquina: boolean;
  origin_gobernanza: boolean;
  created_at: string;
}

export interface CreateCausaDto {
  why_1: string;
  why_2: string;
  why_3: string;
  why_4?: string;
  why_5?: string;
  origin_metodo: boolean;
  origin_maquina: boolean;
  origin_gobernanza: boolean;
}
