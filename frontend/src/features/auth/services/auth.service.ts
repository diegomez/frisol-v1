import api from '../../../shared/api/axios';
import { LoginCredentials, LoginResponse, User } from '../types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get('/auth/me');
    return data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },
};