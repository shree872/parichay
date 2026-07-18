import { apiClient } from '@/api/client';
import type { AuthTokens, User } from '@/types';

export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await apiClient.post<User>('/auth/register', payload);
    return data;
  },

  async login(payload: LoginPayload): Promise<AuthTokens> {
    // Backend uses OAuth2PasswordRequestForm, which requires
    // application/x-www-form-urlencoded with a "username" field.
    const form = new URLSearchParams();
    form.append('username', payload.email);
    form.append('password', payload.password);

    const { data } = await apiClient.post<AuthTokens>('/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return data;
  },

  async me(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },
};
