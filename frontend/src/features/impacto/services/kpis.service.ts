import api from '../../../shared/api/axios';
import { Kpi, CreateKpiDto } from '../types/kpi.types';

export const kpisService = {
  async findAll(projectId: string): Promise<Kpi[]> {
    const { data } = await api.get(`/projects/${projectId}/kpis`);
    return data;
  },

  async create(projectId: string, dto: CreateKpiDto): Promise<Kpi> {
    const { data } = await api.post(`/projects/${projectId}/kpis`, dto);
    return data;
  },

  async update(projectId: string, kpiId: string, dto: Partial<CreateKpiDto>): Promise<Kpi> {
    const { data } = await api.patch(`/projects/${projectId}/kpis/${kpiId}`, dto);
    return data;
  },

  async delete(projectId: string, kpiId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/kpis/${kpiId}`);
  },
};
