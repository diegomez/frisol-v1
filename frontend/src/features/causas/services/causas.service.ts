import api from '../../../shared/api/axios';
import { Causa, CreateCausaDto } from '../types/causa.types';

export const causasService = {
  async findAll(projectId: string): Promise<Causa[]> {
    const { data } = await api.get(`/projects/${projectId}/causas`);
    return data;
  },

  async create(projectId: string, dto: CreateCausaDto): Promise<Causa> {
    const { data } = await api.post(`/projects/${projectId}/causas`, dto);
    return data;
  },

  async update(projectId: string, causaId: string, dto: Partial<CreateCausaDto>): Promise<Causa> {
    const { data } = await api.patch(`/projects/${projectId}/causas/${causaId}`, dto);
    return data;
  },

  async delete(projectId: string, causaId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/causas/${causaId}`);
  },
};
