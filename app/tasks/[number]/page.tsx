import { notFound } from "next/navigation";

import { TaskDetailView } from "@/components/tasks/TaskDetailView";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TaskDetailPage(
  props: PageProps<"/tasks/[number]">,
) {
  const { number } = await props.params;
  const taskNumber = Number(number);

  if (!Number.isInteger(taskNumber)) {
    notFound();
  }

  const task = await prisma.task.findFirst({
    where: { number: taskNumber, deletedAt: null },
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
      todos: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
        include: {
          items: { where: { deletedAt: null }, orderBy: { order: "asc" } },
        },
      },
      notes: {
        where: { deletedAt: null },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!task) {
    notFound();
  }

  const [allProjects, allReleases, allConsolidates] = await Promise.all([
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

  return (
    <TaskDetailView
      task={{
        id: task.id,
        number: task.number,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        pinned: task.pinned,
        createdAt: task.createdAt,
        projectId: task.projectId,
        projectName: task.project.name,
        release: task.taskReleases[0]?.release ?? null,
        consolidate: task.taskConsolidates[0]?.consolidate ?? null,
      }}
      todos={task.todos.map((todo) => ({
        id: todo.id,
        title: todo.title,
        items: todo.items.map((item) => ({
          id: item.id,
          title: item.title,
          completed: item.completed,
        })),
      }))}
      notes={task.notes.map((note) => ({
        id: note.id,
        comment: note.comment,
        createdAt: note.createdAt,
      }))}
      allProjects={allProjects}
      allReleases={allReleases}
      allConsolidates={allConsolidates}
    />
  );
}
