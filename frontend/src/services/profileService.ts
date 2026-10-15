import { api } from "./api";
import type { User } from "../types";

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  education?: string;
  careerInterests?: string[];
  skills?: string[];
}

export const profileService = {
  async getProfile(): Promise<User> {
    const res = await api.get<{ success: boolean; user: User }>("/users/profile");
    return res.data.user;
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const res = await api.put<{ success: boolean; user: User }>("/users/profile", data);
    return res.data.user;
  },
};
