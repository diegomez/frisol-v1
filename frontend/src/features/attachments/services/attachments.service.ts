import api from '../../../shared/api/axios';
import { Attachment } from '../types/attachment.types';

export const attachmentsService = {
  async findAll(projectId: string): Promise<Attachment[]> {
    const { data } = await api.get(`/projects/${projectId}/attachments`);
    return data;
  },

  async upload(projectId: string, title: string, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    const { data } = await api.post(`/projects/${projectId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async delete(projectId: string, attachmentId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/attachments/${attachmentId}`);
  },

  getDownloadUrl(projectId: string, attachmentId: string): string {
    return `/api/v1/projects/${projectId}/attachments/${attachmentId}/download`;
  },
};
