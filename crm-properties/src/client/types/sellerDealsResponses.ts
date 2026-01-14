// src/client/types/sellerDealsResponses.ts

import type { Deal } from "@/src/client/types/deal";
import type { Activity } from "@/src/client/types/activity";

export type SellerDealsListResponse = {
  deals: Deal[];
};

export type SellerDealResponse = {
  deal: Deal;
};

export type SellerDealActivitiesResponse = {
  activities: Activity[];
};

export type SellerDealActivityResponse = {
  activity: Activity;
};
