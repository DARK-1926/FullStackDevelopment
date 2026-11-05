import { describe, it, expect, vi } from "vitest";
import { isValidHandle, getCodeforcesProfile } from "../src/services/codeforcesService.js";

describe("Codeforces Service", () => {
  it("validates handle patterns properly", () => {
    expect(isValidHandle("tourist")).toBe(true);
    expect(isValidHandle("Petr")).toBe(true);
    expect(isValidHandle("a_b-c")).toBe(true);
    expect(isValidHandle("")).toBe(false);
    expect(isValidHandle("ab")).toBe(false);
    expect(isValidHandle("a".repeat(25))).toBe(false);
  });

  it("handles empty or invalid handle in getCodeforcesProfile", async () => {
    const result = await getCodeforcesProfile("??invalid");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid Codeforces handle");
  });

  it("parses user profile response successfully with mocked fetch", async () => {
    const mockUserInfo = {
      status: "OK",
      result: [
        {
          handle: "testUser",
          rating: 1650,
          maxRating: 1720,
          rank: "expert",
          maxRank: "expert",
          titlePhoto: "https://example.com/avatar.jpg",
        },
      ],
    };

    const mockSubmissions = {
      status: "OK",
      result: [
        {
          id: 12345,
          creationTimeSeconds: 1698000000,
          problem: { contestId: 1000, index: "A", name: "Watermelon", rating: 800, tags: ["math"] },
          verdict: "OK",
        },
      ],
    };

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes("user.info")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUserInfo),
        });
      }
      if (url.includes("user.status")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSubmissions),
        });
      }
      return Promise.reject(new Error("Unknown URL"));
    });

    const result = await getCodeforcesProfile("testUser", { forceRefresh: true });
    global.fetch = originalFetch;

    expect(result.success).toBe(true);
    expect(result.handle).toBe("testUser");
    expect(result.rating).toBe(1650);
    expect(result.rank).toBe("expert");
    expect(result.recentSubmissions.length).toBe(1);
    expect(result.recentSubmissions[0].notes).toContain('Watermelon');
  });
});
