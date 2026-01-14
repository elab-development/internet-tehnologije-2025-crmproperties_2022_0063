export type UserRow = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "admin" | "manager" | "seller" | "buyer" | string;
  active: boolean;
};