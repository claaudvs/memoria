"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createTodoGroup,
  createTodoItem,
  deleteTodoGroup,
  deleteTodoItem,
  toggleTodoItem,
} from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type TodoGroupData = {
  id: string;
  title: string;
  items: { id: string; title: string; completed: boolean }[];
};

export function TodoGroups({
  taskId,
  taskNumber,
  todos,
}: {
  taskId: string;
  taskNumber: number;
  todos: TodoGroupData[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newGroupTitle, setNewGroupTitle] = useState("");

  function handleAddGroup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newGroupTitle.trim()) return;
    const formData = new FormData();
    formData.set("taskId", taskId);
    formData.set("title", newGroupTitle.trim());
    startTransition(async () => {
      await createTodoGroup(taskNumber, formData);
      setNewGroupTitle("");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {todos.map((todo) => (
        <TodoGroupCard
          key={todo.id}
          taskNumber={taskNumber}
          todo={todo}
        />
      ))}

      <form
        onSubmit={handleAddGroup}
        className="flex items-center gap-2 border-2 border-dashed border-border p-3"
      >
        <Input
          value={newGroupTitle}
          onChange={(e) => setNewGroupTitle(e.target.value)}
          placeholder="Nueva lista de tareas (ej. QA, Deploy)"
          className="border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <Button type="submit" size="sm" disabled={isPending || !newGroupTitle.trim()}>
          <Plus className="size-4" />
          Agregar
        </Button>
      </form>
    </div>
  );
}

function TodoGroupCard({
  taskNumber,
  todo,
}: {
  taskNumber: number;
  todo: TodoGroupData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newItemTitle, setNewItemTitle] = useState("");

  const doneCount = todo.items.filter((item) => item.completed).length;

  function handleToggle(itemId: string, completed: boolean) {
    startTransition(async () => {
      await toggleTodoItem(itemId, completed, taskNumber);
      router.refresh();
    });
  }

  function handleDeleteItem(itemId: string) {
    startTransition(async () => {
      await deleteTodoItem(itemId, taskNumber);
      router.refresh();
    });
  }

  function handleDeleteGroup() {
    startTransition(async () => {
      await deleteTodoGroup(todo.id, taskNumber);
      router.refresh();
    });
  }

  function handleAddItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    const formData = new FormData();
    formData.set("todoId", todo.id);
    formData.set("title", newItemTitle.trim());
    startTransition(async () => {
      await createTodoItem(taskNumber, formData);
      setNewItemTitle("");
      router.refresh();
    });
  }

  const progress =
    todo.items.length === 0 ? 0 : Math.round((doneCount / todo.items.length) * 100);

  return (
    <div className="overflow-hidden bg-card shadow-soft">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3.5">
        <h3 className="truncate font-semibold leading-snug">{todo.title}</h3>
        <div className="flex shrink-0 items-center gap-3">
          {todo.items.length > 0 && (
            <span className="rounded-full bg-status-finished-bg px-2 py-0.5 font-mono text-[10.5px] font-medium text-status-finished">
              {doneCount}/{todo.items.length}
            </span>
          )}
          <button
            type="button"
            onClick={handleDeleteGroup}
            disabled={isPending}
            className="text-xs font-medium text-muted-foreground hover:text-destructive disabled:opacity-50"
          >
            Eliminar
          </button>
        </div>
      </div>

      {todo.items.length > 0 && (
        <div className="h-0.5 bg-muted">
          <div
            className="h-full bg-status-finished transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="flex flex-col px-4 py-1">
        {todo.items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center gap-2.5 rounded-lg py-2 hover:bg-muted/60"
          >
            <button
              type="button"
              role="checkbox"
              aria-checked={item.completed}
              onClick={() => handleToggle(item.id, !item.completed)}
              disabled={isPending}
              className={cn(
                "flex size-[17px] shrink-0 items-center justify-center rounded-[5px] border transition-colors disabled:opacity-50",
                item.completed
                  ? "border-transparent bg-foreground text-background"
                  : "border-dashed border-muted-foreground/30 text-transparent",
              )}
            >
              <Check className="size-3" strokeWidth={3} />
            </button>
            <span
              className={cn(
                "flex-1 text-sm",
                item.completed && "text-muted-foreground line-through",
              )}
            >
              {item.title}
            </span>
            <button
              type="button"
              onClick={() => handleDeleteItem(item.id)}
              disabled={isPending}
              aria-label="Eliminar ítem"
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive disabled:opacity-50"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddItem} className="flex items-center gap-2 px-4 pt-1 pb-4">
        <span className="size-[17px] shrink-0 rounded-[5px] border border-dashed border-muted-foreground/30" />
        <Input
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          placeholder="Agregar ítem…"
          className="h-7 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
        {newItemTitle.trim() && (
          <span className="font-mono text-[10.5px] text-muted-foreground/60">↵</span>
        )}
        <Button
          type="submit"
          size="icon-sm"
          variant="secondary"
          disabled={isPending || !newItemTitle.trim()}
          aria-label="Agregar ítem"
        >
          <Plus className="size-4" />
        </Button>
      </form>
    </div>
  );
}
