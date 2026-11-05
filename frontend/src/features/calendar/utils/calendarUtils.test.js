import { describe, it, expect } from "vitest";
import {
  normalizeDateKey,
  formatMonthYear,
  generateMonthGrid,
  formatSelectedDateHeading,
  getEventCategoryMeta,
} from "./calendarUtils.js";

describe("calendarUtils", () => {
  it("normalizes date keys properly without UTC shifts", () => {
    expect(normalizeDateKey("2026-11-17")).toBe("2026-11-17");
    expect(normalizeDateKey("2026-11-17T14:30:00Z")).toBe("2026-11-17");
    const d = new Date(2026, 10, 15);
    expect(normalizeDateKey(d)).toBe("2026-11-15");
  });

  it("formats month and year heading", () => {
    expect(formatMonthYear(2026, 10)).toBe("NOVEMBER 2026");
    expect(formatMonthYear(2026, 8)).toBe("SEPTEMBER 2026");
  });

  it("generates a 7-column calendar grid with adjacent month days", () => {
    const grid = generateMonthGrid(2026, 10);

    expect(grid.length % 7).toBe(0);
    const nov1 = grid.find((c) => c.dateKey === "2026-11-01");
    expect(nov1).toBeDefined();
    expect(nov1.isCurrentMonth).toBe(true);
    expect(nov1.dayNumber).toBe(1);
  });

  it("formats selected date heading", () => {
    expect(formatSelectedDateHeading("2026-11-17")).toBe("TUESDAY, NOVEMBER 17");
  });

  it("maps event categories to design accents", () => {
    expect(getEventCategoryMeta("Contest").dotColor).toBe("#38bdf8");
    expect(getEventCategoryMeta("Hackathon").dotColor).toBe("#c084fc");
    expect(getEventCategoryMeta("Deadline").dotColor).toBe("#fbbf24");
    expect(getEventCategoryMeta("Unknown").dotColor).toBe("#818cf8");
  });
});

