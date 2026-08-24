import { createContext, useContext } from "react";
import type React from "react";

// -------- Shared Interfaces --------
export type RestaurantEntry = {
  id: string;
  name: string;
  username: string;
  cuisine: string;
  location: string;
  plan: string;
  status: string;
  branches: number;
  categories?: unknown;
  foodItems?: unknown;
  mrr: number;
  joined: string;
  isVerified?: boolean;
  logoImage?: string;
  logo?: string;
};

export type Ticket = {
  id: string;
  subject: string;
  from: string;
  priority: "low" | "med" | "high";
  status: "open" | "pending" | "resolved";
  updated: string;
};

export type Flag = { key: string; label: string; desc: string; enabled: boolean; rollout: number };

export type Announcement = {
  id: string;
  title: string;
  body: string;
  audience: "all" | "owners" | "staff";
  date: string;
  live: boolean;
};

export interface AdminContextType {
  restaurantsList: RestaurantEntry[];
  setRestaurantsList: React.Dispatch<React.SetStateAction<RestaurantEntry[]>>;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  flags: Flag[];
  setFlags: React.Dispatch<React.SetStateAction<Flag[]>>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  logLevel: string;
  setLogLevel: React.Dispatch<React.SetStateAction<string>>;
}

export const AdminContext = createContext<AdminContextType | null>(null);

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used within an Admin layout provider");
  }
  return context;
}
