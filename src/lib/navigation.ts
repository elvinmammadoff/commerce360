import {
  ChartColumnBig,
  Code2,
  Coins,
  CreditCard,
  History,
  LayoutDashboard,
  ListChecks,
  Package,
  Receipt,
  Settings,
  Upload,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Match the pathname exactly — for index routes like /admin. */
  exact?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const APP_NAV: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Products", href: "/products", icon: Package },
      { label: "Upload", href: "/upload", icon: Upload },
      { label: "History", href: "/history", icon: History },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Credits", href: "/credits", icon: Coins },
      { label: "Billing", href: "/billing", icon: CreditCard },
      { label: "API", href: "/api", icon: Code2 },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

/** Admin console navigation — role-gated, rendered only inside /admin. */
export const ADMIN_NAV: NavGroup[] = [
  {
    label: "Platform",
    items: [
      { label: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: "Manage",
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Orders", href: "/admin/orders", icon: Receipt },
      { label: "Credits", href: "/admin/credits", icon: Coins },
      { label: "Jobs", href: "/admin/jobs", icon: ListChecks },
    ],
  },
  {
    label: "Insights",
    items: [
      { label: "Analytics", href: "/admin/analytics", icon: ChartColumnBig },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export const MARKETING_NAV = [
  { label: "Product", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Customers", href: "/#testimonials" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/#faq" },
];
