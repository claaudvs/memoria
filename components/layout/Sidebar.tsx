"use client";

import {
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Home,
  ListChecks,
  Moon,
  Search,
  Settings,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const COLLAPSED_KEY = "memoria:sidebar-collapsed";
const THEME_KEY = "memoria:theme";

const navItems = [
  { href: "/", label: "Tareas activas", icon: Home },
  { href: "/projects", label: "Proyectos", icon: FolderKanban, disabled: true },
  { href: "/settings", label: "Ajustes", icon: Settings, disabled: true },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });
  }

  function toggleTheme() {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "sticky top-4 flex h-[calc(100vh-2rem)] shrink-0 flex-col gap-6 rounded-3xl bg-card p-4 shadow-soft-md transition-[width] duration-300 ease-in-out",
        collapsed ? "w-24" : "w-64",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <ListChecks className="size-5" />
        </div>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>

      {collapsed ? (
        <button
          type="button"
          disabled
          aria-label="Buscar (próximamente)"
          className="mx-auto flex size-11 items-center justify-center rounded-xl text-muted-foreground/60 disabled:cursor-not-allowed"
        >
          <Search className="size-4" />
        </button>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar"
            disabled
            aria-label="Buscar (próximamente)"
            className="h-9 w-full rounded-xl border-0 bg-secondary pr-3 pl-8 text-sm text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed"
          />
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {!collapsed && (
          <span className="mb-1 px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Principal
          </span>
        )}
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;

          const content = item.disabled ? (
            <div
              aria-disabled="true"
              className={cn(
                "flex items-center gap-3 rounded-full text-sm font-medium text-muted-foreground/50",
                collapsed
                  ? "size-11 justify-center rounded-xl"
                  : "px-3 py-2.5",
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </div>
          ) : (
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-full text-sm font-medium transition-colors",
                active
                  ? collapsed
                    ? "rounded-xl bg-secondary text-foreground"
                    : "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary",
                collapsed ? "size-11 justify-center rounded-xl" : "px-3 py-2.5",
              )}
            >
              <Icon className="size-4.5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

          return (
            <Tooltip key={item.href}>
              <TooltipTrigger
                render={
                  <div className={collapsed ? "mx-auto" : undefined}>
                    {content}
                  </div>
                }
              />
              <TooltipContent side="right">
                {item.disabled ? `${item.label} (próximamente)` : item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
        className={cn(
          "flex items-center gap-3 rounded-full bg-secondary text-sm font-medium text-foreground hover:bg-muted",
          collapsed ? "mx-auto size-11 justify-center rounded-xl" : "px-3 py-2.5",
        )}
      >
        {isDark ? (
          <Sun className="size-4.5 shrink-0" />
        ) : (
          <Moon className="size-4.5 shrink-0" />
        )}
        {!collapsed && <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>}
      </button>
    </aside>
  );
}
