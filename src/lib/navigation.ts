import {
  Code2,
  Coins,
  CreditCard,
  History,
  LayoutDashboard,
  Package,
  Settings,
  ShieldCheck,
  Upload,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
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
  {
    label: "Internal",
    items: [{ label: "Admin", href: "/admin", icon: ShieldCheck }],
  },
];

export const MARKETING_NAV = [
  { label: "Product", href: "/#features" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Customers", href: "/#testimonials" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/#faq" },
];
