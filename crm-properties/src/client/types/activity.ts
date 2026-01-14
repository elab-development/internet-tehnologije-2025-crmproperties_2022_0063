// src/client/types/activity.ts

export type Activity = {
  id: number;
  subject: string;
  type: string | null;
  description: string | null;
  dueDate: string | null;
  dealId: number;
};
