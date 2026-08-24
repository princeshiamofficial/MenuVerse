import {
  LayoutDashboard,
  Building2,
  Tags,
  Utensils,
  BarChart3,
  MessageSquareHeart,
  CreditCard,
  Settings,
  Store,
  ShoppingBag,
  Sparkles,
  Wand2,
  Calculator,
  MonitorSmartphone,
  CalendarDays,
  Users,
  ConciergeBell,
} from "lucide-react";

export type NavItem = {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
};

export function isRouteAllowedForRole(url: string, role?: string | null): boolean {
  if (!role) return true;
  const r = role.toLowerCase().trim().replace(/ /g, "_");

  if (r === "super_admin" || r === "superadmin" || r === "owner") {
    return true;
  }

  // Owner/Super Admin-only administrative routes
  if (url === "/restaurant-profile" || url === "/branches" || url === "/subscription") {
    return false;
  }

  switch (r) {
    case "manager":
      return (
        url !== "/settings" &&
        url !== "/restaurant-profile" &&
        url !== "/branches" &&
        url !== "/categories" &&
        url !== "/food-items" &&
        url !== "/subscription"
      );

    case "cashier":
      return (
        url === "/dashboard" ||
        url === "/orders" ||
        url === "/reservations" ||
        url === "/pos" ||
        url === "/waiter-panel"
      );

    case "chef":
      return url === "/kitchen" || url === "/kds" || url === "/orders";

    case "waiter":
      return url === "/waiter-panel";

    case "host":
      return url === "/reservations";

    default:
      return true;
  }
}

export const mainNavItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Restaurant Profile", url: "/restaurant-profile", icon: Store },
  { title: "Branches", url: "/branches", icon: Building2 },
];

export const menuGroupNavItems: NavItem[] = [
  { title: "Promotions", url: "/promotions", icon: Sparkles },
  { title: "Categories", url: "/categories", icon: Tags },
  { title: "Food Items", url: "/food-items", icon: Utensils },
];

export const operationsNavItems: NavItem[] = [
  { title: "Orders", url: "/orders", icon: ShoppingBag },
  { title: "Reservations", url: "/reservations", icon: CalendarDays },
  { title: "Manage Staff", url: "/staff", icon: Users },
  { title: "POS", url: "/pos", icon: Calculator },
  { title: "Kitchen Display", url: "/kitchen", icon: MonitorSmartphone },
  { title: "Waiter Panel", url: "/waiter-panel", icon: ConciergeBell },
  { title: "Menu AI", url: "/menu-ai", icon: Wand2 },
];

export const insightsNavItems: NavItem[] = [
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Customer Feedback", url: "/feedback", icon: MessageSquareHeart },
];

export const accountNavItems: NavItem[] = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Subscription", url: "/subscription", icon: CreditCard },
];

export const allNavItems: NavItem[] = [
  ...mainNavItems,
  ...menuGroupNavItems,
  ...operationsNavItems,
  ...insightsNavItems,
  ...accountNavItems,
];

export function getAllowedNavItemsForRole(role?: string | null): NavItem[] {
  if (!role) return allNavItems;
  return allNavItems.filter((item) => isRouteAllowedForRole(item.url, role));
}

export function isSinglePageRole(role?: string | null): boolean {
  if (!role) return false;
  const allowed = getAllowedNavItemsForRole(role);
  return allowed.length <= 1;
}
