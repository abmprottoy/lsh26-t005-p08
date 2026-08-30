export type PaginationItem = number | "ellipsis";

export function getPaginationItems(page: number, pageCount: number): PaginationItem[] {
  if (pageCount <= 5) return Array.from({ length: pageCount }, (_, index) => index + 1);
  if (page <= 3) return [1, 2, 3, 4, "ellipsis", pageCount];
  if (page >= pageCount - 2) return [1, "ellipsis", pageCount - 3, pageCount - 2, pageCount - 1, pageCount];
  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", pageCount];
}
