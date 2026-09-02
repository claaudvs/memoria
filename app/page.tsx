import type { Status } from "@prisma/client";

import { TaskBoard } from "@/components/tasks/TaskBoard";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function isDone(status: Status) {
  return status === "FINISHED" || status === "PUBLISHED_PROD";
}

export default async function Home() {
  const [tasks, projects, releases, consolidates] = await Promise.all([
    prisma.task.findMany({
      where: { deletedAt: null },
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

  const boardTasks = tasks
    .map((task) => ({
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
    }))
    // Finished/published tasks sink to the end, but keep their existing
    // pinned/createdAt order (from the query) within each group.
    .sort((a, b) => Number(isDone(a.status)) - Number(isDone(b.status)));

  return (
    <TaskBoard
      tasks={boardTasks}
      projects={projects}
      releases={releases}
      consolidates={consolidates}
    />
  );
}
