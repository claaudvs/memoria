"use client";

import { MessageSquare, Send, Trash2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createNote, deleteNote } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime } from "@/lib/utils";

export type NoteData = { id: string; comment: string; createdAt: Date };

export function CommentSection({
  taskId,
  taskNumber,
  notes,
}: {
  taskId: string;
  taskNumber: number;
  notes: NoteData[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [comment, setComment] = useState("");

  function submit() {
    if (!comment.trim()) return;
    const formData = new FormData();
    formData.set("taskId", taskId);
    formData.set("comment", comment.trim());
    startTransition(async () => {
      await createNote(taskNumber, formData);
      setComment("");
      router.refresh();
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  }

  function handleDelete(noteId: string) {
    startTransition(async () => {
      await deleteNote(noteId, taskNumber);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border p-8 text-center text-muted-foreground">
          <MessageSquare className="size-5" />
          <p className="text-sm">Todavía no hay comentarios.</p>
        </div>
      ) : (
        notes.map((note) => (
          <div
            key={note.id}
            className="group flex gap-3 bg-card p-4 shadow-soft"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <User className="size-3.5" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-[10.5px] text-muted-foreground">
                  {formatRelativeTime(note.createdAt)}
                </span>
                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  disabled={isPending}
                  aria-label="Eliminar comentario"
                  className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <p className="text-sm whitespace-pre-wrap">{note.comment}</p>
            </div>
          </div>
        ))
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 bg-card p-4 shadow-soft"
      >
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribí un comentario…"
          className="min-h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-mono text-[10.5px] text-muted-foreground/60">
            ⌘ + ↵ para enviar
          </span>
          <Button type="submit" size="sm" disabled={isPending || !comment.trim()}>
            <Send className="size-4" />
            Comentar
          </Button>
        </div>
      </form>
    </div>
  );
}
