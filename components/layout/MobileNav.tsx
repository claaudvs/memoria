"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Menu, Moon, Plus, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { type NavCounts, navItems } from "@/components/layout/nav-items";
import { useTheme } from "@/lib/use-theme";
import { cn } from "@/lib/utils";

const tabItems = navItems.filter((item) => !item.disabled).slice(0, 3);

export function MobileNav({ counts }: { counts?: NavCounts }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-1.5 border-t border-border bg-card px-3 pt-1.5 shadow-soft-md md:hidden"
        style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom))" }}
      >
        {tabItems.slice(0, 2).map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-[12px]",
                active ? "bg-secondary" : "",
              )}
            >
              <Icon
                className={cn(
                  "size-4",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        <Link
          href="/"
          aria-label="Ir a Tareas para crear una nueva"
          className="flex size-12 shrink-0 items-center justify-center rounded-[16px] bg-primary text-primary-foreground shadow-[0_6px_16px_-6px_rgba(0,0,0,.5)]"
        >
          <Plus className="size-5" />
        </Link>

        {tabItems.slice(2, 3).map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-[12px]",
                active ? "bg-secondary" : "",
              )}
            >
              <Icon
                className={cn(
                  "size-4",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
          <DialogPrimitive.Trigger
            className="flex min-h-11 flex-1 flex-col items-center justify-center gap-1 rounded-[12px]"
            aria-label="Más opciones de navegación"
          >
            <Menu className="size-4 text-muted-foreground" />
            <span className="text-[10px] font-medium text-muted-foreground">
              Más
            </span>
          </DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/35 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
            <DialogPrimitive.Popup className="fixed inset-x-0 bottom-0 z-50 rounded-t-[20px] bg-card px-4 pt-3 shadow-soft-md outline-none duration-200 data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom">
              <span className="mx-auto mb-3 block h-1 w-9 rounded-full bg-foreground/15" />
              <DialogPrimitive.Title className="mb-2 px-1 text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                Principal
              </DialogPrimitive.Title>
              <div className="flex flex-col gap-1 pb-2">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;
                  const count = counts?.[item.href];

                  if (item.disabled) {
                    return (
                      <div
                        key={item.href}
                        aria-disabled="true"
                        className="flex min-h-13 items-center gap-3 rounded-[12px] px-3 text-sm font-medium text-muted-foreground/50"
                      >
                        <span className="w-[3px] shrink-0 self-stretch rounded-[2px] bg-transparent" />
                        <Icon className="size-4.5 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex min-h-13 items-center gap-3 rounded-[12px] px-3 text-sm font-medium",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-secondary",
                      )}
                    >
                      <span
                        className={cn(
                          "w-[3px] shrink-0 self-stretch rounded-[2px]",
                          active ? "bg-sidebar-rail" : "bg-transparent",
                        )}
                      />
                      <Icon className="size-4.5 shrink-0" />
                      <span className="flex-1">{item.label}</span>
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
                    </Link>
                  );
                })}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="mt-2 flex min-h-13 items-center gap-3 rounded-[12px] border-t border-border px-3 pt-3 text-sm font-medium text-foreground"
                >
                  <span className="flex-1 text-left">
                    {isDark ? "Modo claro" : "Modo oscuro"}
                  </span>
                  {isDark ? (
                    <Sun className="size-4.5 shrink-0 text-muted-foreground" />
                  ) : (
                    <Moon className="size-4.5 shrink-0 text-muted-foreground" />
                  )}
                </button>
              </div>
            </DialogPrimitive.Popup>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </nav>
      <div
        aria-hidden
        className="h-[calc(4rem+env(safe-area-inset-bottom))] shrink-0 md:hidden"
      />
    </>
  );
}
