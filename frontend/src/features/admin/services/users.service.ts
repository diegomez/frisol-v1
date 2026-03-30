import api from '../../../shared/api/axios';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'csm' | 'po' | 'dev';
  active: boolean;
  created_at: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'csm' | 'po' | 'dev';
  active: boolean;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  role?: 'admin' | 'csm' | 'po' | 'dev';
  active?: boolean;
}

export const adminUsersService = {
  async findAll(): Promise<AdminUser[]> {
    const { data } = await api.get('/users');
    return data;
  },

  async create(dto: CreateUserDto): Promise<AdminUser> {
    const { data } = await api.post('/users', dto);
    return data;
  },

  async update(id: string, dto: UpdateUserDto): Promise<AdminUser> {
    const { data } = await api.patch(`/users/${id}`, dto);
    return data;
  },
};
