import { describe, expect, it } from "vitest";
import {
  initialApplications,
  initialCalendarEvents,
  initialDailyChallenge,
  initialGrowthStats,
  initialProfile,
  streakMilestones,
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
    expect(initialProfile.platformHandles.gfg).toBeTruthy();
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
    expect(initialGrowthStats.longestStreak).toBeGreaterThanOrEqual(initialGrowthStats.currentStreak);
    expect(initialGrowthStats.totalProblemsSolved).toBeGreaterThan(0);
    expect(initialGrowthStats.leetcode.solved).toBeGreaterThan(0);
    expect(initialGrowthStats.codeforces.solved).toBeGreaterThan(0);
    expect(initialGrowthStats.gfg.solved).toBeGreaterThan(0);
    expect(initialGrowthStats.github.contributions).toBeGreaterThan(0);
    expect(initialGrowthStats.weeklyActivity.length).toBe(7);
    expect(initialGrowthStats.monthlyActivity.length).toBe(28);
  });

  it("exports streak milestone configurations for consistency tracking", () => {
    expect(streakMilestones.length).toBe(4);
    expect(streakMilestones.every((m) => m.id && m.name && m.targetDays > 0 && m.description)).toBe(true);
    expect(streakMilestones.map((m) => m.targetDays)).toEqual([7, 14, 30, 100]);
  });

  it("contains upcoming calendar events and contests", () => {
    expect(initialCalendarEvents.length).toBeGreaterThan(0);
    expect(
      initialCalendarEvents.every((e) => e.id && e.title && e.type && e.date),
    ).toBe(true);
  });

  it("exports a daily coding challenge to drive habit consistency", () => {
    expect(initialDailyChallenge.id).toBeTruthy();
    expect(initialDailyChallenge.title).toBeTruthy();
    expect(initialDailyChallenge.platform).toBe("LeetCode");
    expect(["Easy", "Medium", "Hard"]).toContain(initialDailyChallenge.difficulty);
    expect(initialDailyChallenge.link).toContain("leetcode.com");
  });
});

