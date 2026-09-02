"use client";

import { Check, GitBranch } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function BranchChip({
  label,
  branchName,
}: {
  label: string;
  branchName: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(branchName);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Tooltip>
      <TooltipTrigger
        onClick={handleCopy}
        className="min-w-0 max-w-full rounded-full outline-none"
      >
        <Badge
          variant="outline"
          className={cn(
            "max-w-full cursor-pointer gap-1 border-transparent bg-secondary text-secondary-foreground hover:bg-muted",
          )}
        >
          {copied ? (
            <Check className="size-3 shrink-0" />
          ) : (
            <GitBranch className="size-3 shrink-0" />
          )}
          <span className="truncate">{label}</span>
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{copied ? "¡Copiado!" : branchName}</TooltipContent>
    </Tooltip>
  );
}
