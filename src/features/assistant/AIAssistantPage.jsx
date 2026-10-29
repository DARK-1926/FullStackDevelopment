import {
  Check,
  Copy,
  Mail,
  Send,
  Sparkles,
  Target,
} from "lucide-react";
import { useState } from "react";
import { useAppContext } from "../../shared/context/AppContext.jsx";
import {
  analyzeResumeJDMatch,
  generateOutreachDraft,
} from "./services/aiAssistantService.js";

export function AIAssistantPage() {
  const {
    opportunities,
    profile,
    selectedOpportunityForAnalysis,
    setSelectedOpportunityForAnalysis,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState("matcher");

  // Resume Matcher State
  const [selectedOppId, setSelectedOppId] = useState(
    selectedOpportunityForAnalysis?.id || opportunities[0]?.id || "",
  );
  const [customJD, setCustomJD] = useState("");
  const [useCustomJD, setUseCustomJD] = useState(false);

  // Cold Email Drafter State
  const [recipientType, setRecipientType] = useState("Recruiter");
  const [outreachTone, setOutreachTone] = useState("Professional");
  const [targetCompany, setTargetCompany] = useState(
    selectedOpportunityForAnalysis?.company || opportunities[0]?.company || "Stripe",
  );
  const [targetRole, setTargetRole] = useState(
    selectedOpportunityForAnalysis?.title || opportunities[0]?.title || "Software Engineering Intern",
  );

  // Results & Loading State
  const [draftResult, setDraftResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Compute Current Opportunity & Local Match Fallback
  const currentOpp = opportunities.find((o) => o.id === selectedOppId);
  const targetSkills = useCustomJD
    ? customJD
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    : currentOpp?.skills || [];

  const roleTitle = useCustomJD ? "Custom Role" : currentOpp?.title || "Role";

  const localMatchAnalysis = analyzeResumeJDMatch(profile.skills, targetSkills, roleTitle);
  const displayMatchAnalysis = localMatchAnalysis;

  // Live or Local Outreach Generation Trigger
  const handleGenerateDraft = async () => {
    setCopied(false);

    // Generate a personalized draft from the student's profile.
    const draft = generateOutreachDraft({
      studentName: profile.name,
      university: profile.university,
      degree: profile.degree,
      company: targetCompany,
      role: targetRole,
      recipientType,
      tone: outreachTone,
      keySkills: profile.skills,
    });
    setDraftResult(draft);
  };

  const handleCopyDraft = () => {
    if (!draftResult) return;
    navigator.clipboard.writeText(`Subject: ${draftResult.subject}\n\n${draftResult.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="page-content">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Career tools</p>
          <h1>Make your application stronger</h1>
          <p className="muted">Check your fit for a role or draft a thoughtful introduction.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === "matcher" ? "active" : ""}`}
          onClick={() => setActiveTab("matcher")}
          type="button"
        >
          <Target size={15} /> Match my skills
        </button>
        <button
          className={`tab-btn ${activeTab === "outreach" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("outreach");
            if (!draftResult) handleGenerateDraft();
          }}
          type="button"
        >
          <Mail size={15} /> Draft an email
        </button>
      </div>

      {activeTab === "matcher" ? (
        <div className="content-grid">
          {/* Left: Input Selection */}
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Target opportunity</p>
                <h2>Select Role to Compare</h2>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <button
                className={`button button-sm ${!useCustomJD ? "button-primary" : "button-secondary"}`}
                onClick={() => setUseCustomJD(false)}
                type="button"
              >
                Catalog Opportunity
              </button>
              <button
                className={`button button-sm ${useCustomJD ? "button-primary" : "button-secondary"}`}
                onClick={() => setUseCustomJD(true)}
                type="button"
              >
                Custom Job Description
              </button>
            </div>

            {!useCustomJD ? (
              <div className="form-group" style={{ marginBottom: 18 }}>
                <label htmlFor="oppPicker">Select from Catalog</label>
                <select
                  id="oppPicker"
                  className="form-select"
                  value={selectedOppId}
                  onChange={(e) => {
                    setSelectedOppId(e.target.value);
                    const found = opportunities.find((o) => o.id === e.target.value);
                    if (found) {
                      setSelectedOpportunityForAnalysis(found);
                      setTargetCompany(found.company);
                      setTargetRole(found.title);
                    }
                  }}
                >
                  {opportunities.map((opp) => (
                    <option key={opp.id} value={opp.id}>
                      {opp.company} — {opp.title} ({opp.type})
                    </option>
                  ))}
                </select>

                {currentOpp && (
                  <p className="muted" style={{ marginTop: 8, fontSize: 12 }}>
                    <strong>Role Summary:</strong> {currentOpp.description}
                  </p>
                )}
              </div>
            ) : (
              <div className="form-group" style={{ marginBottom: 18 }}>
                <label htmlFor="customSkillsInput">Paste Required Skills or Description</label>
                <textarea
                  id="customSkillsInput"
                  className="form-textarea"
                  placeholder="e.g. React, TypeScript, GraphQL, Node.js, Webpack, Vitest"
                  value={customJD}
                  onChange={(e) => setCustomJD(e.target.value)}
                />
              </div>
            )}


            {/* Profile Skills Preview */}
            <div style={{ borderTop: "1px solid var(--color-border-subtle)", paddingTop: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--color-primary)", display: "block", marginBottom: 8 }}>
                Your Declared Profile Skills ({profile.skills.length})
              </span>
              <div className="skills-chips">
                {profile.skills.map((skill) => (
                  <span key={skill} className="skill-chip">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Match Analysis Output */}
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Analysis score</p>
                <h2>
                  Skill Alignment Breakdown{" "}
                </h2>
              </div>
            </div>

            <div className="match-meter-container">
              <div className="match-circle">{displayMatchAnalysis.score}%</div>
              <div>
                <strong style={{ fontSize: 15, display: "block", color: "var(--color-primary)" }}>
                  {displayMatchAnalysis.score >= 75 ? "High Relevance Match" : "Moderate Alignment"}
                </strong>
                <span className="muted" style={{ fontSize: 12 }}>
                  {displayMatchAnalysis.summary}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#34d399", display: "block", marginBottom: 6 }}>
                ✓ Matched Skills ({displayMatchAnalysis.matchedSkills.length})
              </span>
              <div className="skills-chips">
                {displayMatchAnalysis.matchedSkills.length > 0 ? (
                  displayMatchAnalysis.matchedSkills.map((s) => (
                    <span key={s} className="skill-chip matched">
                      ✓ {s}
                    </span>
                  ))
                ) : (
                  <span className="muted" style={{ fontSize: 12 }}>
                    No direct skill overlaps detected.
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", display: "block", marginBottom: 6 }}>
                ⚠ Identified Skill Gaps ({displayMatchAnalysis.missingSkills.length})
              </span>
              <div className="skills-chips">
                {displayMatchAnalysis.missingSkills.length > 0 ? (
                  displayMatchAnalysis.missingSkills.map((s) => (
                    <span
                      key={s}
                      className="skill-chip"
                      style={{ background: "var(--color-warning-bg)", color: "#fbbf24", borderColor: "var(--color-warning-border)" }}
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="muted" style={{ fontSize: 12 }}>
                    No missing skills! You fulfill all listed technical requirements.
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--color-border-subtle)" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#f8fafc", display: "block", marginBottom: 8 }}>
                AI Recommendations
              </span>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                {displayMatchAnalysis.recommendations.map((rec, i) => (
                  <li key={i} style={{ fontSize: 12.5, color: "#cbd5e1", lineHeight: 1.5 }}>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Cold Email Drafter Tab */
        <div className="content-grid">
          {/* Controls */}
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Outreach config</p>
                <h2>Draft Parameters</h2>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label htmlFor="companyTarget">Target Company / Lab</label>
              <input
                id="companyTarget"
                className="form-input"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label htmlFor="roleTarget">Target Role</label>
              <input
                id="roleTarget"
                className="form-input"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label htmlFor="recipType">Recipient Persona</label>
              <select
                id="recipType"
                className="form-select"
                value={recipientType}
                onChange={(e) => setRecipientType(e.target.value)}
              >
                <option value="Recruiter">Technical Recruiter</option>
                <option value="Professor / Research Lead">Professor / Research Lead</option>
                <option value="Engineering Manager">Engineering Manager</option>
                <option value="Alumni / Peer">Alumni / College Senior</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 18 }}>
              <label htmlFor="toneSelect">Outreach Tone</label>
              <select
                id="toneSelect"
                className="form-select"
                value={outreachTone}
                onChange={(e) => setOutreachTone(e.target.value)}
              >
                <option value="Professional">Professional & Courteous</option>
                <option value="Concise">Concise & Direct (2-3 sentences)</option>
                <option value="Enthusiastic">Enthusiastic & High-energy</option>
              </select>
            </div>

            <button
              className="button button-primary"
              style={{ width: "100%" }}
              onClick={handleGenerateDraft}
              type="button"
            >
              <><Sparkles size={15} /> Generate Outreach Draft</>
            </button>
          </div>

          {/* Generated Draft Preview */}
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Generated email</p>
                <h2>Editable Outreach Draft</h2>
              </div>
              {draftResult && (
                <button
                  className="button button-secondary button-sm"
                  onClick={handleCopyDraft}
                  type="button"
                >
                  {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy Email"}
                </button>
              )}
            </div>

            {draftResult ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="form-group">
                  <label htmlFor="subjInput">Subject Line</label>
                  <input
                    id="subjInput"
                    className="form-input"
                    value={draftResult.subject}
                    onChange={(e) =>
                      setDraftResult({ ...draftResult, subject: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="emailBody">Email Body</label>
                  <textarea
                    id="emailBody"
                    className="form-textarea"
                    style={{ minHeight: 220, fontSize: 13, lineHeight: 1.6 }}
                    value={draftResult.body}
                    onChange={(e) =>
                      setDraftResult({ ...draftResult, body: e.target.value })
                    }
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="muted" style={{ fontSize: 12 }}>
                    Feel free to personalize project links before sending.
                  </span>
                  <a
                    href={`mailto:?subject=${encodeURIComponent(draftResult.subject)}&body=${encodeURIComponent(draftResult.body)}`}
                    className="button button-accent button-sm"
                  >
                    <Send size={13} /> Open in Email App
                  </a>
                </div>
              </div>
            ) : (
              <p className="muted">Click regenerate to build your first tailored outreach draft.</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

