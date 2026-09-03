import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { MobileNav } from "@/components/layout/MobileNav";
import type { NavCounts } from "@/components/layout/nav-items";
import { Sidebar } from "@/components/layout/Sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { prisma } from "@/lib/db";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "memoria",
  description: "Personal task tracker",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [tasksCount, projectsCount, releasesCount] = await Promise.all([
    prisma.task.count({ where: { deletedAt: null } }),
    prisma.project.count({ where: { deletedAt: null } }),
    prisma.release.count({ where: { deletedAt: null } }),
  ]);

  const navCounts: NavCounts = {
    "": tasksCount,
    "/": tasksCount,
    "/projects": projectsCount,
    "/releases": releasesCount,
  };

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('memoria:theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <TooltipProvider>
          <div className="flex min-h-screen flex-col gap-4 p-4 md:flex-row">
            <Sidebar counts={navCounts} />
            <main className="flex min-w-0 flex-1 flex-col">{children}</main>
            <MobileNav counts={navCounts} />
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
