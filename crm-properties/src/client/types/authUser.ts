import type { Role } from "./roles";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
};