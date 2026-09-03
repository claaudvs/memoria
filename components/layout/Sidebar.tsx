"use client";

import { Cat, ChevronLeft, ChevronRight, Moon, Search, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { type NavCounts, navItems } from "@/components/layout/nav-items";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/lib/use-theme";
import { cn } from "@/lib/utils";

const COLLAPSED_KEY = "memoria:sidebar-collapsed";

export function Sidebar({ counts }: { counts?: NavCounts }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    setCollapsed(localStorage.getItem(COLLAPSED_KEY) === "1");
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "sticky top-4 hidden h-[calc(100vh-2rem)] shrink-0 flex-col gap-5 rounded-[14px] bg-card p-3.5 shadow-soft-md transition-[width] duration-300 ease-in-out md:flex",
        collapsed ? "w-[88px]" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2",
          collapsed ? "flex-col" : "justify-between",
        )}
      >
        <div
          className={cn(
            "flex min-w-0 items-center gap-2.5",
            collapsed && "flex-col gap-1.5",
          )}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-primary text-primary-foreground">
            <Cat className="size-5" />
          </span>
          {!collapsed && (
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">
                memoria
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {counts?.[""] !== undefined
                  ? `${counts[""]} tareas`
                  : "task tracker"}
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
          className="flex size-6.5 shrink-0 items-center justify-center rounded-[8px] border border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
        >
          {collapsed ? (
            <ChevronRight className="size-3.5" />
          ) : (
            <ChevronLeft className="size-3.5" />
          )}
        </button>
      </div>

      {collapsed ? (
        <button
          type="button"
          disabled
          aria-label="Buscar (próximamente)"
          className="mx-auto flex size-9.5 items-center justify-center rounded-[10px] border border-border bg-secondary text-muted-foreground/70 disabled:cursor-not-allowed"
        >
          <Search className="size-4" />
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-[9px] border border-border bg-secondary px-2.5 py-2 text-muted-foreground/70">
          <Search className="size-4 shrink-0" />
          <span className="flex-1 text-sm text-muted-foreground/70">
            Buscar
          </span>
          <kbd className="font-mono text-[10px] text-muted-foreground/50">
            ⌘K
          </kbd>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
        {!collapsed && (
          <span className="mb-1 px-3 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            Principal
          </span>
        )}
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          const count = counts?.[item.href];

          const content = item.disabled ? (
            <div
              aria-disabled="true"
              className={cn(
                "flex items-center gap-2.5 text-sm font-medium text-muted-foreground/50",
                collapsed
                  ? "size-9.5 justify-center rounded-[10px]"
                  : "rounded-[9px] px-3 py-2.5",
              )}
            >
              {collapsed ? (
                <span className="font-mono text-[11px]">{item.initials}</span>
              ) : (
                <>
                  <span className="w-[3px] shrink-0 self-stretch rounded-[2px] bg-transparent" />
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                </>
              )}
            </div>
          ) : (
            <Link
              href={item.href}
              className={cn(
                "relative flex items-center gap-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow-[0_4px_12px_-4px_rgba(0,0,0,.35)]"
                  : "text-foreground hover:bg-secondary",
                collapsed
                  ? "size-9.5 justify-center rounded-[10px]"
                  : "rounded-[9px] px-3 py-2.5",
              )}
            >
              {collapsed ? (
                <>
                  <span className="font-mono text-[11px]">
                    {item.initials}
                  </span>
                  {active && (
                    <span className="absolute top-1.5 bottom-1.5 -left-[9px] w-[3px] rounded-[2px] bg-sidebar-rail" />
                  )}
                </>
              ) : (
                <>
                  <span
                    className={cn(
                      "w-[3px] shrink-0 self-stretch rounded-[2px]",
                      active ? "bg-sidebar-rail" : "bg-transparent",
                    )}
                  />
                  <Icon className="size-4 shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {count !== undefined && (
                    <span
                      className={cn(
                        "font-mono text-[11px]",
                        active
                          ? "text-primary-foreground/60"
                          : "text-muted-foreground",
                      )}
                    >
                      {count}
                    </span>
                  )}
                </>
              )}
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

      {collapsed ? (
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
          className="mx-auto flex size-9.5 items-center justify-center rounded-[10px] border border-border bg-secondary text-muted-foreground hover:border-foreground/20 hover:text-foreground"
        >
          {isDark ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
          className="flex items-center gap-2.5 rounded-[9px] border border-border bg-secondary px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          <span className="flex-1 text-left">
            {isDark ? "Modo claro" : "Modo oscuro"}
          </span>
          <span className="flex h-4 w-7 shrink-0 items-center rounded-full bg-foreground/15 p-0.5">
            <span
              className={cn(
                "size-3 rounded-full bg-card shadow-sm transition-transform",
                isDark && "translate-x-3",
              )}
            />
          </span>
        </button>
      )}
    </aside>
  );
}
