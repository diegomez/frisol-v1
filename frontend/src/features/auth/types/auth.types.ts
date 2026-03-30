export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'csm' | 'po' | 'dev';
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}