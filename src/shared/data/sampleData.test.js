import { describe, expect, it } from "vitest";
import {
  initialApplications,
  initialCalendarEvents,
  initialGrowthStats,
  initialProfile,
  upcomingOpportunities,
} from "./sampleData.js";

describe("sample opportunity and domain data", () => {
  it("contains source-ready opportunities with required fields", () => {
    expect(upcomingOpportunities.length).toBeGreaterThan(0);
    expect(
      upcomingOpportunities.every(
        (opportunity) =>
          opportunity.id &&
          opportunity.title &&
          opportunity.company &&
          opportunity.location &&
          opportunity.type &&
          opportunity.skills.length > 0,
      ),
    ).toBe(true);
  });

  it("contains initial student profile and platform handles", () => {
    expect(initialProfile.name).toBe("Alex Shah");
    expect(initialProfile.skills.length).toBeGreaterThan(3);
    expect(initialProfile.platformHandles.leetcode).toBeTruthy();
    expect(initialProfile.platformHandles.github).toBeTruthy();
  });

  it("contains initial application tracker records", () => {
    expect(initialApplications.length).toBeGreaterThan(0);
    expect(
      initialApplications.every((app) => app.id && app.company && app.role && app.status),
    ).toBe(true);
  });

  it("contains growth statistics and streak risk status", () => {
    expect(initialGrowthStats.currentStreak).toBeGreaterThan(0);
    expect(initialGrowthStats.leetcode.solved).toBeGreaterThan(0);
    expect(initialGrowthStats.weeklyActivity.length).toBe(7);
  });

  it("contains upcoming calendar events and contests", () => {
    expect(initialCalendarEvents.length).toBeGreaterThan(0);
    expect(
      initialCalendarEvents.every((e) => e.id && e.title && e.type && e.date),
    ).toBe(true);
  });
});

