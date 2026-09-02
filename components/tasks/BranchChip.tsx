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
        className="rounded-full outline-none"
      >
        <Badge
          variant="outline"
          className={cn(
            "cursor-pointer gap-1 border-transparent bg-secondary text-secondary-foreground hover:bg-muted",
          )}
        >
          {copied ? (
            <Check className="size-3" />
          ) : (
            <GitBranch className="size-3" />
          )}
          {label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>{copied ? "¡Copiado!" : branchName}</TooltipContent>
    </Tooltip>
  );
}
