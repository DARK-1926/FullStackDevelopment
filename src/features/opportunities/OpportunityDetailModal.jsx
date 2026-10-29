import {
  Bookmark,
  CheckCircle,
  ExternalLink,
  MapPin,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useAppContext } from "../../shared/context/AppContext.jsx";

export function OpportunityDetailModal({ opportunity, onClose }) {
  const {
    profile,
    savedOpportunityIds,
    toggleSaveOpportunity,
    applications,
    addApplicationFromOpportunity,
    setSelectedOpportunityForAnalysis,
    setActivePage,
  } = useAppContext();

  if (!opportunity) return null;

  const isSaved = savedOpportunityIds.includes(opportunity.id);
  const isApplied = applications.some((a) => a.opportunityId === opportunity.id);

  const studentSkillsLower = profile.skills.map((s) => s.toLowerCase());

  const handleAnalyzeWithAI = () => {
    setSelectedOpportunityForAnalysis(opportunity);
    onClose();
    setActivePage("assistant");
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className={`tag tag-${opportunity.type.toLowerCase()}`}>
              {opportunity.type}
            </span>
            <h2 style={{ margin: "8px 0 4px", fontSize: 20, color: "var(--color-primary)" }}>
              {opportunity.title}
            </h2>
            <p className="muted" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <strong>{opportunity.company}</strong> · <MapPin size={14} /> {opportunity.location}
            </p>
          </div>
          <button className="close-btn" onClick={onClose} type="button" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Source Attribution & Trust Banner */}
          <div className="source-attribution">
            <ShieldCheck size={16} color="#16a34a" />
            <span>
              Verified source: <strong>{opportunity.source}</strong> · Retrieved {opportunity.retrievedAt.split("T")[0]}
            </span>
          </div>

          {/* Quick Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--color-border)",
              padding: 14,
              borderRadius: "var(--radius-md)",
            }}
          >
            <div>
              <span style={{ fontSize: 11, color: "var(--color-text-muted)", display: "block" }}>
                COMPENSATION / PRIZE
              </span>
              <strong style={{ fontSize: 13.5, color: "#34d399" }}>{opportunity.stipend}</strong>
            </div>
            <div>
              <span style={{ fontSize: 11, color: "var(--color-text-muted)", display: "block" }}>
                APPLICATION DEADLINE
              </span>
              <strong style={{ fontSize: 13.5, color: "#fb923c" }}>{opportunity.deadline}</strong>
            </div>
            <div>
              <span style={{ fontSize: 11, color: "var(--color-text-muted)", display: "block" }}>
                ELIGIBILITY
              </span>
              <strong style={{ fontSize: 13.5, color: "#f8fafc" }}>{opportunity.experience} Level</strong>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 style={{ fontSize: 15, margin: "0 0 8px", color: "#f8fafc" }}>
              About the Position
            </h3>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: "#cbd5e1", margin: 0 }}>
              {opportunity.description}
            </p>
          </div>

          {/* Key Requirements */}
          <div>
            <h3 style={{ fontSize: 15, margin: "0 0 8px", color: "#f8fafc" }}>
              Key Qualifications & Requirements
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
              {opportunity.requirements.map((req, idx) => (
                <li key={idx} style={{ fontSize: 13, lineHeight: 1.5, color: "#94a3b8" }}>
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Required Skills vs Your Skills */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3 style={{ fontSize: 15, margin: 0, color: "#f8fafc" }}>
                Core Skills Required
              </h3>
              <span style={{ fontSize: 11.5, color: "#34d399", fontWeight: 600 }}>
                Green = In your profile
              </span>
            </div>
            <div className="skills-chips">
              {opportunity.skills.map((skill) => {
                const isMatched = studentSkillsLower.includes(skill.toLowerCase());
                return (
                  <span
                    key={skill}
                    className={`skill-chip ${isMatched ? "matched" : ""}`}
                    title={isMatched ? "Matches your profile skill" : "Skill not listed in your profile"}
                  >
                    {isMatched && "✓ "}
                    {skill}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="button button-secondary"
            onClick={() => toggleSaveOpportunity(opportunity.id)}
            type="button"
          >
            <Bookmark size={15} fill={isSaved ? "currentColor" : "none"} />
            {isSaved ? "Saved" : "Save"}
          </button>

          <button
            className="button button-accent"
            onClick={handleAnalyzeWithAI}
            type="button"
          >
            <Sparkles size={15} /> Analyze Match & Draft Email
          </button>

          {isApplied ? (
            <button className="button button-secondary" disabled type="button">
              <CheckCircle size={15} color="#16a34a" /> In Application Tracker
            </button>
          ) : (
            <button
              className="button button-primary"
              onClick={() => {
                addApplicationFromOpportunity(opportunity);
              }}
              type="button"
            >
              Add to Applications
            </button>
          )}

          <a
            href={opportunity.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-secondary"
          >
            Source Page <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}

