import { notFound } from "next/navigation";

import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage(
  props: PageProps<"/projects/[id]">,
) {
  const { id } = await props.params;

  const [
    project,
    tasks,
    releases,
    consolidates,
    allProjects,
    allReleases,
    allConsolidates,
  ] = await Promise.all([
    prisma.project.findFirst({ where: { id, deletedAt: null } }),
    prisma.task.findMany({
      where: { projectId: id, deletedAt: null },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      include: {
        project: true,
        taskReleases: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { release: true },
        },
        taskConsolidates: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { consolidate: true },
        },
      },
    }),
    prisma.release.findMany({
      where: { projectId: id, deletedAt: null },
      orderBy: { name: "asc" },
    }),
    prisma.consolidate.findMany({
      where: { projectId: id, deletedAt: null },
      orderBy: { name: "asc" },
    }),
    prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.release.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, projectId: true, name: true, branchName: true },
    }),
    prisma.consolidate.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, projectId: true, name: true, branchName: true },
    }),
  ]);

  if (!project) {
    notFound();
  }

  const detailTasks = tasks.map((task) => ({
    id: task.id,
    number: task.number,
    title: task.title,
    projectId: task.projectId,
    projectName: task.project.name,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    pinned: task.pinned,
    release: task.taskReleases[0]?.release ?? null,
    consolidate: task.taskConsolidates[0]?.consolidate ?? null,
  }));

  return (
    <ProjectDetail
      project={{
        id: project.id,
        name: project.name,
        description: project.description,
      }}
      tasks={detailTasks}
      releases={releases}
      consolidates={consolidates}
      allProjects={allProjects}
      allReleases={allReleases}
      allConsolidates={allConsolidates}
    />
  );
}
