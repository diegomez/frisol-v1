export interface Symptom {
  id: string;
  project_id: string;
  what: string;
  who: string;
  when_field: string;
  where_field: string;
  how: string;
  declaration: string;
  created_at: string;
}

export interface CreateSymptomDto {
  what: string;
  who: string;
  when_field: string;
  where_field: string;
  how: string;
  declaration: string;
}
