import { describe, expect, it } from "vitest";
import { upcomingOpportunities } from "./sampleData";

describe("sample opportunity data", () => {
  it("contains source-ready opportunities with required fields", () => {
    expect(upcomingOpportunities.length).toBeGreaterThan(0);
    expect(
      upcomingOpportunities.every(
        (opportunity) => opportunity.id && opportunity.title && opportunity.company,
      ),
    ).toBe(true);
  });
});
