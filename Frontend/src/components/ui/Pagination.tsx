"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";

/**
 * Cursor pagination controls. Cursors are opaque, so this is prev/next only —
 * deliberately not numbered pages, which cursor APIs cannot support.
 */
export function CursorPagination({
  onPrevious, onNext, hasPrevious, hasMore, isLoading, shown, total,
}: {
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious: boolean;
  hasMore: boolean;
  isLoading?: boolean;
  shown?: number;
  total?: number;
}) {
  if (!hasPrevious && !hasMore) return null;
  return (
    <nav className="flex items-center justify-between gap-4 pt-4" aria-label="Pagination">
      <p className="text-sm text-foreground-subtle" aria-live="polite">
        {shown !== undefined && total !== undefined ? `Showing ${shown} of ${total}` : ""}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={onPrevious} disabled={!hasPrevious || isLoading}>
          <ChevronLeft className="size-4" /> Previous
        </Button>
        <Button variant="secondary" size="sm" onClick={onNext} disabled={!hasMore || isLoading}>
          Next <ChevronRight className="size-4" />
        </Button>
      </div>
    </nav>
  );
}
