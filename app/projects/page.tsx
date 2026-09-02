import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: {
        select: {
          tasks: { where: { deletedAt: null, status: { in: ["ACTIVE", "BLOCK"] } } },
        },
      },
    },
  });

  const gridProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    updatedAt: project.updatedAt,
    activeTaskCount: project._count.tasks,
  }));

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
      <ProjectGrid projects={gridProjects} />
    </div>
  );
}
