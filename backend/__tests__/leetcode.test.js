import { describe, expect, it } from "vitest";
import { isValidHandle, getLeetCodeProfile, getLeetCodeDailyChallenge } from "../src/services/leetcodeService.js";

describe("leetcodeService", () => {
  describe("isValidHandle", () => {
    it("accepts valid alphanumeric LeetCode handles with underscores, hyphens, and dots", () => {
      expect(isValidHandle("alex_shah")).toBe(true);
      expect(isValidHandle("tourist")).toBe(true);
      expect(isValidHandle("mohit")).toBe(true);
      expect(isValidHandle("coder-1926")).toBe(true);
    });

    it("rejects invalid characters, empty strings, and out-of-range lengths", () => {
      expect(isValidHandle("")).toBe(false);
      expect(isValidHandle("a")).toBe(false);
      expect(isValidHandle("handle with spaces")).toBe(false);
      expect(isValidHandle("invalid!character")).toBe(false);
      expect(isValidHandle(null)).toBe(false);
      expect(isValidHandle(undefined)).toBe(false);
    });
  });

  describe("getLeetCodeProfile input handling", () => {
    it("returns error early for invalid handles without performing network requests", async () => {
      const result = await getLeetCodeProfile("!");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid LeetCode handle");
    });
  });

  describe("getLeetCodeDailyChallenge", () => {
    it("returns a valid daily challenge structure with title, platform, and link", async () => {
      const result = await getLeetCodeDailyChallenge();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.platform).toBe("LeetCode");
      expect(result.data.title).toBeTruthy();
      expect(result.data.link).toContain("leetcode.com");
    });
  });
});
