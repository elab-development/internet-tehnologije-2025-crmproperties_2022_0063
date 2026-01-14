export type ClientRow = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  city: string | null;
  dealsCount: number;
  activeDealsCount: number;
  closedDealsCount: number;
};