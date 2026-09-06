"use client";

import { createContext, useContext, useId, useState } from "react";
import { cn } from "@/lib/cn";

/** Accessible tabs: arrow-key navigation, proper roles, one tabbable stop. */
const TabsContext = createContext<{ value: string; setValue: (v: string) => void; baseId: string } | null>(null);

export function Tabs({
  defaultValue, value: controlled, onValueChange, children, className,
}: {
  defaultValue: string;
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const baseId = useId();
  const value = controlled ?? internal;
  const setValue = (v: string) => {
    if (controlled === undefined) setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value, setValue, baseId }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div role="tablist" className={cn("flex gap-1 overflow-x-auto border-b border-border-default", className)}>
      {children}
    </div>
  );
}

export function Tab({ value, children, count }: { value: string; children: React.ReactNode; count?: number }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("Tab must be used inside Tabs");
  const selected = ctx.value === value;
  return (
    <button
      role="tab"
      id={`${ctx.baseId}-tab-${value}`}
      aria-selected={selected}
      aria-controls={`${ctx.baseId}-panel-${value}`}
      tabIndex={selected ? 0 : -1}
      onClick={() => ctx.setValue(value)}
      onKeyDown={(e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        const tabs = Array.from(
          e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
        );
        const i = tabs.indexOf(e.currentTarget);
        const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
        next?.focus();
        next?.click();
      }}
      className={cn(
        "relative -mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
        selected
          ? "border-primary-600 text-primary-700 dark:text-primary-400"
          : "border-transparent text-foreground-subtle hover:border-border-strong hover:text-foreground",
      )}
    >
      {children}
      {count !== undefined && (
        <span className="ml-2 rounded-full bg-surface-muted px-1.5 py-0.5 text-xs tabular-nums text-foreground-muted">
          {count}
        </span>
      )}
    </button>
  );
}

export function TabPanel({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("TabPanel must be used inside Tabs");
  if (ctx.value !== value) return null;
  return (
    <div
      role="tabpanel"
      id={`${ctx.baseId}-panel-${value}`}
      aria-labelledby={`${ctx.baseId}-tab-${value}`}
      tabIndex={0}
      className={cn("pt-5", className)}
    >
      {children}
    </div>
  );
}
