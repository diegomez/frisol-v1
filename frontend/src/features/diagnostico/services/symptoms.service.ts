import api from '../../../shared/api/axios';
import { Symptom, CreateSymptomDto } from '../types/symptom.types';

export const symptomsService = {
  async findAll(projectId: string): Promise<Symptom[]> {
    const { data } = await api.get(`/projects/${projectId}/symptoms`);
    return data;
  },

  async create(projectId: string, dto: CreateSymptomDto): Promise<Symptom> {
    const { data } = await api.post(`/projects/${projectId}/symptoms`, dto);
    return data;
  },

  async update(projectId: string, symptomId: string, dto: Partial<CreateSymptomDto>): Promise<Symptom> {
    const { data } = await api.patch(`/projects/${projectId}/symptoms/${symptomId}`, dto);
    return data;
  },

  async delete(projectId: string, symptomId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/symptoms/${symptomId}`);
  },
};
