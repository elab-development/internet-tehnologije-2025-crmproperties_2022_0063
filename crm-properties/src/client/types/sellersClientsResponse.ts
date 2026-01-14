import type { ClientRow } from "@/src/client/types/clientRow";

export type SellersClientsResponse = {
  seller: { id: number; name: string; email: string };
  clients: ClientRow[];
};