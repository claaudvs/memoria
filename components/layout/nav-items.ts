import {
  FolderKanban,
  GitBranch,
  Home,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  initials: string;
  disabled?: boolean;
};

export const navItems: NavItem[] = [
  { href: "/", label: "Tareas", icon: Home, initials: "Ta" },
  {
    href: "/projects",
    label: "Proyectos",
    icon: FolderKanban,
    initials: "Pr",
  },
  { href: "/releases", label: "Releases", icon: GitBranch, initials: "Re" },
  {
    href: "/settings",
    label: "Ajustes",
    icon: Settings,
    initials: "Aj",
    disabled: true,
  },
];

export type NavCounts = Partial<Record<string, number>>;
