import { cn } from "@/lib/cn";

/**
 * Table primitives. The wrapper scrolls horizontally on its own so a wide table
 * never forces the page body to scroll sideways on mobile.
 */
export function TableWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-xl border border-border-default bg-surface", className)}>
      {children}
    </div>
  );
}

export function Table({ children, className, caption }: { children: React.ReactNode; className?: string; caption?: string }) {
  return (
    <table className={cn("w-full min-w-[40rem] border-collapse text-sm", className)}>
      {caption && <caption className="sr-only">{caption}</caption>}
      {children}
    </table>
  );
}

export function Th({ children, className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "border-b border-border-default bg-surface-muted px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-foreground-subtle",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function Td({ children, className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn("border-b border-border-default px-4 py-3 text-foreground", className)} {...props}>
      {children}
    </td>
  );
}

export function Tr({ children, className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("transition-colors hover:bg-surface-muted/60", className)} {...props}>
      {children}
    </tr>
  );
}
