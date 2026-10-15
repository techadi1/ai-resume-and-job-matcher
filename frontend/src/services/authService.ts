import { api } from "./api";
import type { User } from "../types";

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/register", data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>("/auth/login", data);
    return res.data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<{ success: boolean; user: User }>("/auth/me");
    return res.data.user || res.data;
  },
};
