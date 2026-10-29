import {
  Calendar,
  ExternalLink,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAppContext } from "../../shared/context/AppContext.jsx";

const STATUS_COLUMNS = [
  { key: "Saved", label: "Saved Roles", color: "#64748b" },
  { key: "Applied", label: "Applied", color: "#0284c7" },
  { key: "Interviewing", label: "Interviewing", color: "#d97706" },
  { key: "Offer", label: "Offers Received", color: "#16a34a" },
  { key: "Rejected", label: "Archived", color: "#94a3b8" },
];

export function ApplicationsPage() {
  const {
    applications,
    updateApplicationStatus,
    updateApplicationNotes,
    deleteApplication,
    createManualApplication,
    setActivePage,
  } = useAppContext();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [tempNotes, setTempNotes] = useState("");

  // New application form state
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newLocation, setNewLocation] = useState("Remote");
  const [newStatus, setNewStatus] = useState("Applied");
  const [newDeadline, setNewDeadline] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) return;

    createManualApplication({
      company: newCompany.trim(),
      role: newRole.trim(),
      location: newLocation,
      status: newStatus,
      appliedDate: new Date().toISOString().split("T")[0],
      deadline: newDeadline || "Ongoing",
      notes: newNotes.trim() || "Tracked manually",
    });

    // Reset and close
    setNewCompany("");
    setNewRole("");
    setNewNotes("");
    setNewDeadline("");
    setIsAddModalOpen(false);
  };

  const handleSaveNotes = (id) => {
    updateApplicationNotes(id, tempNotes);
    setEditingNotesId(null);
  };

  return (
    <main className="page-content">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your search</p>
          <h1>Applications</h1>
          <p className="muted">
            Organize your internship and job applications across every recruitment stage.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="button button-secondary"
            onClick={() => setActivePage("opportunities")}
            type="button"
          >
            Browse Opportunities
          </button>
          <button
            className="button button-primary"
            onClick={() => setIsAddModalOpen(true)}
            type="button"
          >
            <Plus size={16} /> Track New Application
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="tracker-board" aria-label="Application stages kanban board">
        {STATUS_COLUMNS.map((column) => {
          const colApps = applications.filter((app) => app.status === column.key);

          return (
            <div className="tracker-column" key={column.key}>
              <div className="column-header">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: column.color,
                    }}
                  />
                  {column.label}
                </span>
                <span className="column-badge">{colApps.length}</span>
              </div>

              {colApps.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "24px 10px",
                    color: "var(--color-text-subtle)",
                    fontSize: 12,
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px dashed var(--color-border)",
                  }}
                >
                  No applications here
                </div>
              ) : (
                colApps.map((app) => (
                  <article className="tracker-card" key={app.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <strong>{app.role}</strong>
                      <button
                        className="text-button"
                        onClick={() => deleteApplication(app.id)}
                        title="Remove application"
                        style={{ color: "#94a3b8" }}
                        type="button"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <span>{app.company}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5 }}>
                      <MapPin size={11} /> {app.location}
                    </span>

                    {app.matchScore && (
                      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#34d399" }}>
                        <Sparkles size={11} /> Match score: {app.matchScore}%
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#fb923c" }}>
                      <Calendar size={11} /> Due: {app.deadline}
                    </div>

                    {/* Notes preview or edit */}
                    {editingNotesId === app.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                        <textarea
                          className="form-textarea"
                          style={{ minHeight: 60, fontSize: 12 }}
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                        />
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="button button-primary button-sm"
                            onClick={() => handleSaveNotes(app.id)}
                            type="button"
                          >
                            Save
                          </button>
                          <button
                            className="button button-secondary button-sm"
                            onClick={() => setEditingNotesId(null)}
                            type="button"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="card-notes"
                        onClick={() => {
                          setEditingNotesId(app.id);
                          setTempNotes(app.notes);
                        }}
                        title="Click to edit notes"
                        style={{ cursor: "pointer" }}
                      >
                        {app.notes || "+ Add interview or follow-up notes..."}
                      </div>
                    )}

                    {/* Stage selector dropdown */}
                    <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <select
                        className="filter-select"
                        style={{ fontSize: 11, padding: "4px 6px" }}
                        value={app.status}
                        onChange={(e) =>
                          updateApplicationStatus(app.id, e.target.value)
                        }
                      >
                        {STATUS_COLUMNS.map((col) => (
                          <option key={col.key} value={col.key}>
                            Move to: {col.label}
                          </option>
                        ))}
                      </select>

                      {app.sourceUrl && (
                        <a
                          href={app.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-button"
                          title="Open job source"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          );
        })}
      </div>

      {/* Add Application Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ margin: 0, fontSize: 18, color: "var(--color-primary)" }}>
                  Track New Application
                </h2>
                <p className="muted">Add a job, internship, or research opening to your board.</p>
              </div>
              <button
                className="close-btn"
                onClick={() => setIsAddModalOpen(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="compName">Company or Institution *</label>
                  <input
                    id="compName"
                    className="form-input"
                    placeholder="e.g. Google, Stripe, IIT Delhi Lab"
                    required
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="roleTitle">Role or Position Title *</label>
                  <input
                    id="roleTitle"
                    className="form-input"
                    placeholder="e.g. Software Engineering Intern, ML Researcher"
                    required
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label htmlFor="locInput">Location / Work Type</label>
                    <input
                      id="locInput"
                      className="form-input"
                      placeholder="e.g. Bengaluru, Remote, Hybrid"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="stageSelect">Current Stage</label>
                    <select
                      id="stageSelect"
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      {STATUS_COLUMNS.map((col) => (
                        <option key={col.key} value={col.key}>
                          {col.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="deadlineInput">Deadline or Next Step Date</label>
                  <input
                    id="deadlineInput"
                    className="form-input"
                    placeholder="e.g. Nov 15, 2026"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notesInput">Initial Notes / Interview Links</label>
                  <textarea
                    id="notesInput"
                    className="form-textarea"
                    placeholder="Referral name, round progress, follow-up date..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

