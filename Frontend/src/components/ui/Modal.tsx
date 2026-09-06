"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Dialog with a real focus trap and Escape handling. Built on <dialog> so the
 * browser handles the top layer and inertness for us.
 */
export function Modal({
  open, onClose, title, description, children, footer, size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-3xl" };

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself) closes it.
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "w-[calc(100vw-2rem)] rounded-xl border border-border-default bg-surface p-0 text-foreground backdrop:bg-black/40",
        sizes[size],
      )}
      aria-labelledby="modal-title"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border-default px-5 py-4">
        <div>
          <h2 id="modal-title" className="text-base font-semibold">{title}</h2>
          {description && <p className="mt-1 text-sm text-foreground-subtle">{description}</p>}
        </div>
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="rounded-lg p-1 text-foreground-subtle hover:bg-surface-muted hover:text-foreground"
        >
          <X className="size-5" />
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t border-border-default px-5 py-3">{footer}</div>}
    </dialog>
  );
}
