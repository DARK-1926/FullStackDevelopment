import { describe, expect, it } from "vitest";
import {
  getGeeksforGeeksContests,
  getAllRealContests,
} from "../src/services/contestService.js";

describe("Contest Service", () => {
  it("generates next recurring GeeksforGeeks contests properly", () => {
    const contests = getGeeksforGeeksContests();
    expect(Array.isArray(contests)).toBe(true);
    expect(contests.length).toBeGreaterThan(0);
    expect(contests[0].organizer).toBe("GeeksforGeeks");
    expect(contests[0].type).toBe("Contest");
    expect(contests[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("handles getAllRealContests gracefully and returns formatted array", async () => {
    const all = await getAllRealContests();
    expect(Array.isArray(all)).toBe(true);

    expect(all.length).toBeGreaterThan(0);
    const item = all[0];
    expect(item).toHaveProperty("id");
    expect(item).toHaveProperty("title");
    expect(item).toHaveProperty("organizer");
    expect(item).toHaveProperty("date");
    expect(item).toHaveProperty("time");
  });
});
