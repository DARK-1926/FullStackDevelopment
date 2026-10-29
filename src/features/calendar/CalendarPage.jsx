import {
  Bell,
  CalendarDays,
  Clock,
  ExternalLink,
  Flame,
  Globe,
  Plus,
  Trophy,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAppContext } from "../../shared/context/AppContext.jsx";

export function CalendarPage() {
  const { calendarEvents, toggleCalendarReminder } = useAppContext();

  const [activeTab, setActiveTab] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New event local state
  const [title, setTitle] = useState("");
  const [organizer, setOrganizer] = useState("");
  const [eventType, setEventType] = useState("Contest");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");

  const filteredEvents = useMemo(() => {
    if (activeTab === "All") return calendarEvents;
    return calendarEvents.filter((event) => event.type === activeTab);
  }, [calendarEvents, activeTab]);

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (!title.trim() || !date.trim()) return;

    const newEvent = {
      id: `evt-${Date.now()}`,
      title: title.trim(),
      organizer: organizer.trim() || "Independent",
      type: eventType,
      date,
      time: time.trim() || "All Day",
      link: link.trim() || "#",
      status: "Upcoming",
      description: description.trim() || "User-added deadline/event",
      tags: [eventType],
      isReminderSet: true,
    };

    calendarEvents.push(newEvent);
    setIsAddModalOpen(false);
    setTitle("");
    setOrganizer("");
    setDate("");
    setTime("");
    setLink("");
    setDescription("");
  };

  return (
    <main className="page-content">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Plan ahead</p>
          <h1>Deadlines & events</h1>
          <p className="muted">Keep applications, contests, and reminders in one place.</p>
        </div>
        <button
          className="button button-primary"
          onClick={() => setIsAddModalOpen(true)}
          type="button"
        >
          <Plus size={16} /> Add Custom Event
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${activeTab === "All" ? "active" : ""}`}
          onClick={() => setActiveTab("All")}
          type="button"
        >
          All Events ({calendarEvents.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "Contest" ? "active" : ""}`}
          onClick={() => setActiveTab("Contest")}
          type="button"
        >
          Contests ({calendarEvents.filter((e) => e.type === "Contest").length})
        </button>
        <button
          className={`tab-btn ${activeTab === "Hackathon" ? "active" : ""}`}
          onClick={() => setActiveTab("Hackathon")}
          type="button"
        >
          Hackathons ({calendarEvents.filter((e) => e.type === "Hackathon").length})
        </button>
        <button
          className={`tab-btn ${activeTab === "Deadline" ? "active" : ""}`}
          onClick={() => setActiveTab("Deadline")}
          type="button"
        >
          Application Deadlines ({calendarEvents.filter((e) => e.type === "Deadline").length})
        </button>
      </div>

      {/* Events List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filteredEvents.map((evt) => (
          <article
            key={evt.id}
            className="panel"
            style={{
              padding: "18px 22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius-md)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  background:
                    evt.type === "Contest"
                      ? "rgba(245, 158, 11, 0.12)"
                      : evt.type === "Hackathon"
                        ? "rgba(168, 85, 247, 0.12)"
                        : "rgba(239, 68, 68, 0.12)",
                  color:
                    evt.type === "Contest"
                      ? "#fbbf24"
                      : evt.type === "Hackathon"
                        ? "#c084fc"
                        : "#f87171",
                  border:
                    evt.type === "Contest"
                      ? "1px solid rgba(245, 158, 11, 0.25)"
                      : evt.type === "Hackathon"
                        ? "1px solid rgba(168, 85, 247, 0.25)"
                        : "1px solid rgba(239, 68, 68, 0.25)",
                }}
              >
                {evt.type === "Contest" ? (
                  <Trophy size={20} />
                ) : evt.type === "Hackathon" ? (
                  <Flame size={20} />
                ) : (
                  <CalendarDays size={20} />
                )}
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span
                    className={`tag ${
                      evt.type === "Contest"
                        ? ""
                        : evt.type === "Hackathon"
                          ? "tag-hackathon"
                          : "tag-research"
                    }`}
                  >
                    {evt.type}
                  </span>
                  <strong style={{ fontSize: 15, color: "#f8fafc" }}>
                    {evt.title}
                  </strong>
                  {evt.status === "Live" && (
                    <span
                      style={{
                        background: "var(--color-success-bg)",
                        color: "#34d399",
                        border: "1px solid var(--color-success-border)",
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 99,
                        fontWeight: 700,
                      }}
                    >
                      ● LIVE NOW
                    </span>
                  )}
                </div>

                <p className="muted" style={{ margin: "0 0 6px", fontSize: 13 }}>
                  {evt.organizer} · {evt.description}
                </p>

                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--color-text-muted)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <CalendarDays size={13} /> {evt.date}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={13} /> {evt.time}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                className={`button button-sm ${
                  evt.isReminderSet ? "button-accent" : "button-secondary"
                }`}
                onClick={() => toggleCalendarReminder(evt.id)}
                type="button"
                title={evt.isReminderSet ? "Reminder active" : "Set reminder"}
              >
                <Bell size={13} fill={evt.isReminderSet ? "currentColor" : "none"} />
                {evt.isReminderSet ? "Alert Set" : "Notify Me"}
              </button>

              <a
                href={evt.link}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-primary button-sm"
              >
                <Globe size={13} /> Portal <ExternalLink size={12} />
              </a>
            </div>
          </article>
        ))}
      </div>

      {/* Add Custom Event Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 style={{ margin: 0, fontSize: 18, color: "var(--color-primary)" }}>
                  Add Custom Calendar Item
                </h2>
                <p className="muted">Add a contest, college hackathon, or interview deadline.</p>
              </div>
              <button
                className="close-btn"
                onClick={() => setIsAddModalOpen(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddEvent}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="evtTitle">Event or Deadline Title *</label>
                  <input
                    id="evtTitle"
                    className="form-input"
                    placeholder="e.g. AtCoder Beginner Contest 375"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label htmlFor="evtOrg">Organizer / Platform</label>
                    <input
                      id="evtOrg"
                      className="form-input"
                      placeholder="e.g. AtCoder, Major League Hacking"
                      value={organizer}
                      onChange={(e) => setOrganizer(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="evtTypeSelect">Type</label>
                    <select
                      id="evtTypeSelect"
                      className="form-select"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                    >
                      <option value="Contest">Contest</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Deadline">Application Deadline</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label htmlFor="evtDate">Date *</label>
                    <input
                      id="evtDate"
                      type="date"
                      className="form-input"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="evtTime">Time / Duration</label>
                    <input
                      id="evtTime"
                      className="form-input"
                      placeholder="e.g. 18:30 IST (2 hrs)"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="evtLink">Link / Registration URL</label>
                  <input
                    id="evtLink"
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="evtDesc">Details / Notes</label>
                  <textarea
                    id="evtDesc"
                    className="form-textarea"
                    placeholder="Description or notes about participation..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
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
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

