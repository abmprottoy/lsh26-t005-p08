import { describe, expect, it } from "vitest";
import { getPaginationItems } from "./pagination";

describe("getPaginationItems", () => {
  it("shows every page for short result sets", () => {
    expect(getPaginationItems(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it("keeps the current page and both boundaries visible", () => {
    expect(getPaginationItems(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
  });

  it("shows a useful range at the end", () => {
    expect(getPaginationItems(9, 10)).toEqual([1, "ellipsis", 7, 8, 9, 10]);
  });
});
