"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import {
  BranchModal,
  type BranchKind,
  type BranchModalItem,
  type BranchModalProject,
} from "@/components/branches/BranchModal";
import { BranchListCard, type BranchListItem } from "@/components/branches/BranchListCard";
import { cn } from "@/lib/utils";

const TABS: { key: BranchKind; label: string }[] = [
  { key: "release", label: "Releases" },
  { key: "consolidate", label: "Consolidados" },
];

const KIND_LABEL: Record<BranchKind, string> = {
  release: "release",
  consolidate: "consolidado",
};

export function BranchBoard({
  releases,
  consolidates,
  projects,
}: {
  releases: BranchListItem[];
  consolidates: BranchListItem[];
  projects: BranchModalProject[];
}) {
  const [tab, setTab] = useState<BranchKind>("release");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BranchModalItem | null>(null);

  const items = tab === "release" ? releases : consolidates;

  function openCreate() {
    setEditingItem(null);
    setModalOpen(true);
  }

  function openEdit(item: BranchListItem) {
    setEditingItem({
      id: item.id,
      projectId: item.projectId,
      name: item.name,
      description: item.description,
      branchName: item.branchName,
      status: item.status,
    });
    setModalOpen(true);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Releases y consolidados</h1>

      <div className="flex w-fit items-center gap-1 rounded-full bg-secondary p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              tab === key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <button
          type="button"
          onClick={openCreate}
          className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-transparent text-muted-foreground transition-colors hover:border-foreground/20 hover:bg-card hover:text-foreground"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Plus className="size-5" />
          </span>
          <span className="text-sm font-medium">Nuevo {KIND_LABEL[tab]}</span>
        </button>

        {items.map((item) => (
          <BranchListCard
            key={item.id}
            item={item}
            kind={tab}
            onEdit={() => openEdit(item)}
          />
        ))}
      </div>

      {modalOpen && (
        <BranchModal
          kind={tab}
          open={modalOpen}
          onOpenChange={setModalOpen}
          projects={projects}
          item={editingItem}
        />
      )}
    </div>
  );
}
