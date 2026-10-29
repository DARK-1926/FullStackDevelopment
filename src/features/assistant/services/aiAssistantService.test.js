import { describe, expect, it } from "vitest";
import {
  analyzeResumeJDMatch,
  generateOutreachDraft,
  parseNaturalLanguageQuery,
} from "./aiAssistantService.js";

describe("aiAssistantService", () => {
  describe("analyzeResumeJDMatch", () => {
    it("accurately calculates matched skills and missing skill gaps", () => {
      const studentSkills = ["React", "TypeScript", "HTML", "CSS", "Git"];
      const jobSkills = ["React", "TypeScript", "GraphQL", "Docker"];

      const result = analyzeResumeJDMatch(studentSkills, jobSkills, "Frontend Engineer");

      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.matchedSkills).toContain("React");
      expect(result.matchedSkills).toContain("TypeScript");
      expect(result.missingSkills).toContain("GraphQL");
      expect(result.missingSkills).toContain("Docker");
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it("gives near perfect score when all requirements match", () => {
      const studentSkills = ["Python", "PyTorch", "Machine Learning", "Transformers"];
      const jobSkills = ["Python", "PyTorch"];

      const result = analyzeResumeJDMatch(studentSkills, jobSkills, "ML Researcher");

      expect(result.score).toBeGreaterThanOrEqual(95);
      expect(result.missingSkills.length).toBe(0);
    });
  });

  describe("generateOutreachDraft", () => {
    it("generates professional email tailored to a recruiter", () => {
      const draft = generateOutreachDraft({
        studentName: "Alex Shah",
        university: "NIT",
        degree: "B.Tech CSE",
        company: "Stripe",
        role: "Software Engineering Intern",
        recipientType: "Recruiter",
        tone: "Professional",
        keySkills: ["React", "TypeScript"],
      });

      expect(draft.subject).toContain("Stripe");
      expect(draft.subject).toContain("Alex Shah");
      expect(draft.body).toContain("NIT");
      expect(draft.body).toContain("React, TypeScript");
    });

    it("generates inquiry tailored to a professor", () => {
      const draft = generateOutreachDraft({
        studentName: "Alex Shah",
        university: "NIT",
        degree: "B.Tech CSE",
        company: "Microsoft Research",
        role: "Research Fellow",
        recipientType: "Professor / Research Lead",
        tone: "Professional",
        keySkills: ["PyTorch", "Python"],
      });

      expect(draft.subject).toContain("Research");
      expect(draft.body).toContain("Dear Professor");
      expect(draft.body).toContain("lab's publications");
    });
  });

  describe("parseNaturalLanguageQuery", () => {
    it("extracts internship type and remote location", () => {
      const parsed = parseNaturalLanguageQuery("paid remote internship for machine learning");
      expect(parsed.detectedType).toBe("Internship");
      expect(parsed.detectedLocation).toBe("Remote");
    });

    it("extracts research fellowship and hybrid location", () => {
      const parsed = parseNaturalLanguageQuery("hybrid research fellowship in robotics");
      expect(parsed.detectedType).toBe("Research");
      expect(parsed.detectedLocation).toBe("Hybrid");
    });

    it("extracts hackathon query", () => {
      const parsed = parseNaturalLanguageQuery("global student hackathon");
      expect(parsed.detectedType).toBe("Hackathon");
    });
  });
});

