import {
  Check,
  Code2,
  Download,
  LogIn,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAppContext } from "../../shared/context/AppContext.jsx";

export function SettingsPage() {
  const {
    profile,
    updateProfile,
    addSkill,
    removeSkill,
    resetAllData,
    user,
    logout,
    openAuthModal,
  } = useAppContext();

  // Local form state
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [university, setUniversity] = useState(profile.university);
  const [degree, setDegree] = useState(profile.degree);
  const [gradYear, setGradYear] = useState(profile.gradYear);
  const [resumeSummary, setResumeSummary] = useState(profile.resumeSummary);

  const [leetcode, setLeetcode] = useState(profile.platformHandles.leetcode);
  const [codeforces, setCodeforces] = useState(profile.platformHandles.codeforces);
  const [github, setGithub] = useState(profile.platformHandles.github);


  const [newSkillInput, setNewSkillInput] = useState("");
  const [saveToast, setSaveToast] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      university,
      degree,
      gradYear,
      resumeSummary,
      platformHandles: {
        leetcode,
        codeforces,
        github,
      },
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const handleAddSkillKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (newSkillInput.trim()) {
        addSkill(newSkillInput.trim());
        setNewSkillInput("");
      }
    }
  };

  const handleExportData = () => {
    const data = {
      profile,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `opportunity-os-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset all data back to the default sample dataset?")) {
      resetAllData();
      window.location.reload();
    }
  };

  const suggestedSkills = ["Next.js", "Docker", "GraphQL", "PostgreSQL", "Tailwind CSS", "Go"];

  return (
    <main className="page-content">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your details</p>
          <h1>Profile & preferences</h1>
          <p className="muted">
            Keep your profile and skills up to date.
          </p>
        </div>
        {saveToast && (
          <div className="auth-alert success" style={{ padding: "8px 16px" }}>
            <Check size={16} /> Changes saved and synced!
          </div>
        )}
      </div>

      <div className="content-grid">
        {/* Left Column: Profile & Handles Form */}
        <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Academic & Personal</p>
                <h2>Profile Information</h2>
              </div>
              <User size={18} color="#818cf8" />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label htmlFor="studentName">Full Name *</label>
                  <input
                    id="studentName"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="studentEmail">Email *</label>
                  <input
                    id="studentEmail"
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="universityInput">University / Institute</label>
                <input
                  id="universityInput"
                  className="form-input"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12 }}>
                <div className="form-group">
                  <label htmlFor="degreeInput">Degree / Major</label>
                  <input
                    id="degreeInput"
                    className="form-input"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="gradYearInput">Graduation Year</label>
                  <input
                    id="gradYearInput"
                    className="form-input"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="resumeSummaryInput">Professional Summary (used by AI tools)</label>
                <textarea
                  id="resumeSummaryInput"
                  className="form-textarea"
                  value={resumeSummary}
                  onChange={(e) => setResumeSummary(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Coding Platform Handles */}
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Streak integration</p>
                <h2>Platform Handles</h2>
              </div>
              <Code2 size={18} color="#818cf8" />
            </div>
            <p className="muted" style={{ marginBottom: 14 }}>
              Connecting your handles enables cross-platform problem counting and streak-risk alerts.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="form-group">
                <label htmlFor="leetcodeHandle">LeetCode Username</label>
                <input
                  id="leetcodeHandle"
                  className="form-input"
                  value={leetcode}
                  onChange={(e) => setLeetcode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="cfHandle">Codeforces Handle</label>
                <input
                  id="cfHandle"
                  className="form-input"
                  value={codeforces}
                  onChange={(e) => setCodeforces(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="ghHandle">GitHub Username</label>
                <input
                  id="ghHandle"
                  className="form-input"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button className="button button-primary" type="submit">
                <Save size={15} /> Save Profile Changes
              </button>
            </div>
          </div>
        </form>

        {/* Account, skills and data */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Account */}
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Your account</p>
                <h2>Account</h2>
              </div>
              <ShieldCheck size={18} color="#10b981" />
            </div>

            {user ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid var(--color-success-border)",
                    borderRadius: "var(--radius-md)",
                    padding: "12px 14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <strong style={{ display: "block", color: "#f8fafc", fontSize: 13.5 }}>
                      {user.name}
                    </strong>
                    <span style={{ fontSize: 12, color: "#34d399" }}>{user.email}</span>
                  </div>
                  <span
                    className="tag"
                    style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34d399" }}
                  >
                    Active Session
                  </span>
                </div>
                <p className="muted" style={{ fontSize: 12 }}>
                  Your account is ready to use.
                </p>
                <button
                  className="button button-secondary button-sm"
                  onClick={logout}
                  type="button"
                >
                  <LogOut size={14} /> Log Out of Account
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p className="muted" style={{ fontSize: 12.5 }}>
                  Sign in to keep your profile and applications with your account.
                </p>
                <button
                  className="button button-accent button-sm"
                  onClick={openAuthModal}
                  type="button"
                >
                  <LogIn size={15} /> Sign In / Register Account
                </button>
              </div>
            )}
          </div>

          {/* Skills Management */}
          <div className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Job matching engine</p>
                <h2>Skill Inventory ({profile.skills.length})</h2>
              </div>
            </div>
            <p className="muted" style={{ marginBottom: 14 }}>
              These skills are matched against job requirements to calculate relevance scores and identify missing gaps.
            </p>

            {/* Input to add a new skill */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <input
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Type skill & press Enter (e.g. Docker, GraphQL)"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={handleAddSkillKey}
              />
              <button
                className="button button-secondary"
                onClick={() => {
                  if (newSkillInput.trim()) {
                    addSkill(newSkillInput.trim());
                    setNewSkillInput("");
                  }
                }}
                type="button"
              >
                <Plus size={15} /> Add
              </button>
            </div>

            {/* Suggested quick-add skills */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>
                Quick add popular skills:
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {suggestedSkills
                  .filter((s) => !profile.skills.includes(s))
                  .map((skill) => (
                    <button
                      key={skill}
                      className="text-button"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid var(--color-border)",
                        padding: "3px 8px",
                        borderRadius: 99,
                        fontSize: 11,
                      }}
                      onClick={() => addSkill(skill)}
                      type="button"
                    >
                      + {skill}
                    </button>
                  ))}
              </div>
            </div>

            {/* Current skill tags */}
            <div className="skills-chips">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="skill-chip"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    paddingRight: 6,
                  }}
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    style={{
                      border: 0,
                      background: "transparent",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                    }}
                    title={`Remove ${skill}`}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Local Storage & Reset */}
          <div className="panel">
            <div className="panel-heading">
              <div>
              <p className="eyebrow">Your data</p>
                <h2>Data Management</h2>
              </div>
            </div>
            <p className="muted" style={{ marginBottom: 16 }}>
              Download a copy of your profile or restore the sample data.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                className="button button-secondary"
                onClick={handleExportData}
                type="button"
              >
                <Download size={15} /> Export Profile JSON Backup
              </button>

              <button
                className="button button-danger"
                onClick={handleReset}
                type="button"
              >
                <RefreshCw size={15} /> Reset to Default Seed Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
