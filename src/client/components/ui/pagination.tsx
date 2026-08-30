import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "../../lib/utils";
import { getPaginationItems } from "../../lib/pagination";
import { Button } from "./button";

interface DataPaginationProps {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
  className?: string;
}

export function DataPagination({
  page,
  pageCount,
  total,
  pageSize,
  onPageChange,
  itemLabel = "items",
  className,
}: DataPaginationProps) {
  if (total === 0) return null;

  const safePage = Math.min(Math.max(page, 1), Math.max(pageCount, 1));
  const start = (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", className)}>
      <p className="text-xs text-slate-500 dark:text-zinc-400" aria-live="polite">
        Showing <span className="font-semibold text-slate-700 dark:text-zinc-200">{start}–{end}</span> of {total} {itemLabel}
      </p>
      {pageCount > 1 && (
        <nav aria-label={`${itemLabel} pagination`} className="flex items-center gap-1">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(safePage - 1)}
            disabled={safePage === 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="size-4" />
          </Button>
          {getPaginationItems(safePage, pageCount).map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="flex size-8 items-center justify-center text-slate-400" aria-hidden="true">
                <MoreHorizontal className="size-4" />
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === safePage ? "default" : "ghost"}
                size="icon"
                className="size-8"
                onClick={() => onPageChange(item)}
                aria-label={`Go to page ${item}`}
                aria-current={item === safePage ? "page" : undefined}
              >
                {item}
              </Button>
            ),
          )}
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-8"
            onClick={() => onPageChange(safePage + 1)}
            disabled={safePage === pageCount}
            aria-label="Go to next page"
          >
            <ChevronRight className="size-4" />
          </Button>
        </nav>
      )}
    </div>
  );
}
