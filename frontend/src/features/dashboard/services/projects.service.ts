import api from '../../../shared/api/axios';
import { Project, ProjectProgress } from '../types/project.types';

export const projectsService = {
  async findAll(filter: 'mine' | 'all' = 'all'): Promise<Project[]> {
    const { data } = await api.get('/projects', { params: { filter } });
    return data;
  },

  async findById(id: string): Promise<any> {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },

  async create(): Promise<Project> {
    const { data } = await api.post('/projects');
    return data;
  },

  async getProgress(id: string): Promise<ProjectProgress> {
    const { data } = await api.get(`/projects/${id}/progress`);
    return data;
  },
};
