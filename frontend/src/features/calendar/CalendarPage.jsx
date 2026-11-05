import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Globe,
  MapPin,
  Plus,
  RotateCw,
  Search,
  Sparkles,
  Tag,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyState } from "../../shared/components/EmptyState.jsx";
import { useAppContext } from "../../shared/context/AppContext.jsx";
import { initialCalendarEvents } from "../../shared/data/sampleData.js";
import {
  formatMonthYear,
  formatSelectedDateHeading,
  generateMonthGrid,
  getEventCategoryMeta,
  normalizeDateKey,
} from "./utils/calendarUtils.js";
import "./calendar-page.css";

export function CalendarPage() {
  const {
    calendarEvents: contextEvents,
    toggleCalendarReminder,
    addCalendarEvent,
    refreshLiveContests,
    isContestsLoading,
  } = useAppContext();


  const calendarEvents = useMemo(() => {
    if (contextEvents && contextEvents.length > 0) {
      return contextEvents;
    }
    return initialCalendarEvents;
  }, [contextEvents]);

  const today = useMemo(() => new Date(), []);
  const todayDateKey = useMemo(() => normalizeDateKey(today), [today]);


  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth());
  const [selectedDate, setSelectedDate] = useState(() => todayDateKey);


  const nextUpcomingEvent = useMemo(() => {
    const todayStr = normalizeDateKey(new Date());
    return (
      calendarEvents
        .filter((e) => e.date >= todayStr)
        .sort((a, b) => a.date.localeCompare(b.date))[0] || calendarEvents[0]
    );
  }, [calendarEvents]);


  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);


  useEffect(() => {
    if (!isAddModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsAddModalOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddModalOpen]);


  const [modalTitle, setModalTitle] = useState("");
  const [modalOrganizer, setModalOrganizer] = useState("");
  const [modalType, setModalType] = useState("Contest");
  const [modalDate, setModalDate] = useState("");
  const [modalTime, setModalTime] = useState("");
  const [modalLink, setModalLink] = useState("");
  const [modalDescription, setModalDescription] = useState("");

  const agendaRef = useRef(null);


  const eventsByDate = useMemo(() => {
    const map = new Map();
    for (const evt of calendarEvents) {
      const dateKey = normalizeDateKey(evt.date);
      if (!dateKey) continue;

      if (categoryFilter !== "All" && evt.type !== categoryFilter) {
        continue;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = evt.title && evt.title.toLowerCase().includes(q);
        const matchesOrg = evt.organizer && evt.organizer.toLowerCase().includes(q);
        const matchesDesc = evt.description && evt.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesOrg && !matchesDesc) {
          continue;
        }
      }

      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey).push(evt);
    }
    return map;
  }, [calendarEvents, categoryFilter, searchQuery]);


  const calendarCells = useMemo(() => {
    return generateMonthGrid(currentYear, currentMonth);
  }, [currentYear, currentMonth]);


  const selectedDateEvents = useMemo(() => {
    return eventsByDate.get(selectedDate) || [];
  }, [eventsByDate, selectedDate]);


  const [userExpandedId, setUserExpandedId] = useState(null);
  const expandedEventId = userExpandedId !== null
    ? userExpandedId
    : (selectedDateEvents[0]?.id || null);


  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleTodayClick = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    const todayKey = normalizeDateKey(now);
    setSelectedDate(todayKey);
  };

  const handleDateClick = (dateKey) => {
    if (dateKey === selectedDate) return;
    setSelectedDate(dateKey);
    setUserExpandedId(null);
    if (window.innerWidth < 768 && agendaRef.current) {
      agendaRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleToggleExpand = (id) => {
    setUserExpandedId((prev) => (prev === id ? "__NONE__" : id));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!modalTitle.trim() || !modalDate.trim()) return;

    const newEvt = {
      id: `evt-${Date.now()}`,
      title: modalTitle.trim(),
      organizer: modalOrganizer.trim() || "Independent",
      type: modalType,
      date: modalDate,
      time: modalTime.trim() || "All Day",
      link: modalLink.trim() || "#",
      status: "Upcoming",
      description: modalDescription.trim() || "User-added developer activity",
      tags: [modalType],
      isReminderSet: true,
    };

    addCalendarEvent(newEvt);
    setSelectedDate(normalizeDateKey(modalDate));
    setIsAddModalOpen(false);

    setModalTitle("");
    setModalOrganizer("");
    setModalDate("");
    setModalTime("");
    setModalLink("");
    setModalDescription("");
  };

  return (
    <main className="page-content calendar-page-container">

      <div className="calendar-header-toolbar">
        <div>
          <h1 style={{ margin: "2px 0 6px 0", fontSize: 24, fontWeight: 800, color: "var(--color-text-title)" }}>
            Contests &amp; Events
          </h1>
          <p className="muted" style={{ margin: 0, fontSize: 13 }}>
            Stay ahead of the competition. Discover coding contests, hackathons, workshops and developer events.
          </p>
        </div>

        <div className="calendar-filters-row">

          <div style={{ position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
              }}
            />
            <input
              type="text"
              placeholder="Search contests, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: "rgba(13, 17, 23, 0.75)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: 8,
                padding: "7px 12px 7px 30px",
                fontSize: 12,
                color: "#f8fafc",
                outline: "none",
                width: 200,
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <X size={12} />
              </button>
            )}
          </div>


          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              background: "rgba(13, 17, 23, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 8,
              padding: "7px 10px",
              fontSize: 12,
              color: "#f8fafc",
              outline: "none",
              cursor: "pointer",
            }}
            aria-label="Filter events by category"
          >
            <option value="All">All Categories</option>
            <option value="Contest">Coding Contests</option>
            <option value="Hackathon">Hackathons</option>
            <option value="Deadline">Application Deadlines</option>
          </select>


          <button
            className="button button-secondary"
            onClick={() => refreshLiveContests(true)}
            type="button"
            disabled={isContestsLoading}
            style={{ padding: "6px 12px", fontSize: 12, display: "inline-flex", alignItems: "center", gap: 6 }}
            title="Fetch real-time contests from Codeforces, LeetCode, CodeChef, Devpost & GFG"
          >
            <RotateCw size={13} className={isContestsLoading ? "spin-icon" : ""} />
            {isContestsLoading ? "Syncing..." : "Sync Live Contests"}
          </button>


          <button
            className="button button-primary"
            onClick={() => setIsAddModalOpen(true)}
            type="button"
            style={{ padding: "6px 14px", fontSize: 12 }}
          >
            <Plus size={14} /> Add Event
          </button>
        </div>
      </div>


      <div className="calendar-main-layout">

        <section className="calendar-glass-card" aria-label="Monthly Calendar Overview">

          <div className="calendar-nav-bar">
            <div className="calendar-current-month">
              <CalendarDays size={18} color="#222222" />
              <span>{formatMonthYear(currentYear, currentMonth)}</span>
            </div>

            <div className="calendar-nav-controls">
              <button
                type="button"
                className="calendar-nav-btn"
                onClick={handleTodayClick}
                title="Navigate to Today"
              >
                Today
              </button>
              <button
                type="button"
                className="calendar-nav-icon-btn"
                onClick={handlePrevMonth}
                aria-label="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="calendar-nav-icon-btn"
                onClick={handleNextMonth}
                aria-label="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>


          <div className="calendar-grid-header">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
              <div key={dayName} className="calendar-weekday-label">
                {dayName}
              </div>
            ))}
          </div>


          <div className="calendar-grid-days" role="grid">
            {calendarCells.map((cell) => {
              const dayEvents = eventsByDate.get(cell.dateKey) || [];
              const isSelected = cell.dateKey === selectedDate;

              return (
                <div
                  key={cell.dateKey}
                  className={`calendar-date-cell ${cell.isCurrentMonth ? "" : "other-month"} ${
                    cell.isToday ? "is-today" : ""
                  } ${isSelected ? "is-selected" : ""}`}
                  onClick={() => !isSelected && handleDateClick(cell.dateKey)}
                  role="gridcell"
                  tabIndex={isSelected ? -1 : 0}
                  aria-selected={isSelected}
                  aria-label={`${cell.dateKey}${cell.isToday ? ", today" : ""}${
                    dayEvents.length > 0
                      ? `, ${dayEvents.length} events: ${dayEvents.map((e) => e.title).join(", ")}`
                      : ", no events"
                  }`}
                  onKeyDown={(e) => {
                    if (!isSelected && (e.key === "Enter" || e.key === " ")) {
                      handleDateClick(cell.dateKey);
                    }
                  }}
                >
                  <span className="calendar-date-num">{cell.dayNumber}</span>


                  {dayEvents.length > 0 && (
                    <div className="cell-event-chips">
                      {dayEvents.slice(0, 2).map((evt) => {
                        const chipClass =
                          evt.type === "Contest"
                            ? "chip-contest"
                            : evt.type === "Hackathon"
                            ? "chip-hackathon"
                            : evt.type === "Deadline"
                            ? "chip-deadline"
                            : "chip-default";

                        return (
                          <div
                            key={evt.id}
                            className={`cell-event-chip ${chipClass}`}
                            title={`${evt.title} - ${evt.time}`}
                          >
                            <span>{evt.title}</span>
                            {evt.time && <span className="chip-time">{evt.time.split(" ")[0]}</span>}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <span style={{ fontSize: "9px", color: "#64748b", fontWeight: 700 }}>
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>


          <div className="calendar-legend-bar">
            <div className="calendar-legend-items">
              <div className="calendar-legend-item">
                <span className="legend-swatch" style={{ background: "rgba(56, 189, 248, 0.45)" }} />
                <span>Coding Contests</span>
              </div>
              <div className="calendar-legend-item">
                <span className="legend-swatch" style={{ background: "rgba(192, 132, 252, 0.45)" }} />
                <span>Hackathons</span>
              </div>
              <div className="calendar-legend-item">
                <span className="legend-swatch" style={{ background: "rgba(251, 191, 36, 0.45)" }} />
                <span>Deadlines</span>
              </div>
              <div className="calendar-legend-item">
                <span className="legend-swatch" style={{ background: "rgba(52, 211, 153, 0.45)" }} />
                <span>Workshops</span>
              </div>
            </div>
            <span>Click any cell to inspect</span>
          </div>
        </section>


        <section ref={agendaRef} className="agenda-section" aria-label="Selected Date Agenda">
          <div className="agenda-header-banner">
            <div>
              <h2 className="agenda-date-title">{formatSelectedDateHeading(selectedDate)}</h2>
              <p className="agenda-context-sub">
                {selectedDateEvents.length > 0
                  ? "Here's what's happening on this day."
                  : "No activities scheduled for this date."}
              </p>
            </div>

            <span className="agenda-count-badge">
              {selectedDateEvents.length} {selectedDateEvents.length === 1 ? "Activity" : "Activities"}
            </span>
          </div>

          {selectedDateEvents.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="No events scheduled for this day"
              message="Looks like a quiet day. Explore highlighted dates on the calendar or jump to upcoming rounds."
              actionLabel={
                nextUpcomingEvent
                  ? `Next Live Event (${nextUpcomingEvent.date}): ${nextUpcomingEvent.title.slice(0, 24)}...`
                  : "Browse November 1 Events"
              }
              actionIcon={nextUpcomingEvent ? Sparkles : null}
              onAction={
                nextUpcomingEvent
                  ? () => {
                      setSelectedDate(nextUpcomingEvent.date);
                      const parts = nextUpcomingEvent.date.split("-").map(Number);
                      if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                        setCurrentYear(parts[0]);
                        setCurrentMonth(parts[1] - 1);
                      }
                    }
                  : () => setSelectedDate("2026-11-01")
              }
            />
          ) : (
            <div className="agenda-events-list">
              {selectedDateEvents.map((evt) => {
                const isExpanded = expandedEventId === evt.id;
                const meta = getEventCategoryMeta(evt.type);

                return (
                  <article
                    key={evt.id}
                    className={`event-accordion-card ${isExpanded ? "expanded" : ""}`}
                  >
                    <button
                      type="button"
                      className="event-accordion-trigger"
                      onClick={() => handleToggleExpand(evt.id)}
                      aria-expanded={isExpanded}
                    >
                      <div className="event-trigger-left">
                        <span className="event-time-pill">
                          <Clock size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
                          {evt.time || "All Day"}
                        </span>

                        <div className="event-title-meta">
                          <h3 className="event-row-title">{evt.title}</h3>
                          <div className="event-row-subtitle">
                            <span style={{ fontWeight: 700, color: "#333333" }}>
                              {evt.organizer}
                            </span>
                            <span>•</span>
                            <span>{meta.label}</span>
                            {evt.status === "Live" && (
                              <>
                                <span>•</span>
                                <span style={{ color: "#222222", fontWeight: 700 }}>● LIVE NOW</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="event-trigger-right">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCalendarReminder(evt.id);
                          }}
                          style={{
                            cursor: "pointer",
                            padding: "6px",
                            borderRadius: 6,
                            background: evt.isReminderSet ? "#f1f1ef" : "transparent",
                            color: evt.isReminderSet ? "#222222" : "#666666",
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                          title={evt.isReminderSet ? "Reminder Active" : "Set Alert"}
                        >
                          <Bell size={15} />
                        </span>

                        <div className="event-expand-icon">
                          <ChevronDown size={15} />
                        </div>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="event-accordion-body">
                        {evt.description && (
                          <p className="event-description-text">{evt.description}</p>
                        )}

                        <div className="event-details-grid">
                          <div className="event-detail-item">
                            <Globe size={14} color="#333333" />
                            <span>Platform: <strong>{evt.organizer}</strong></span>
                          </div>

                          <div className="event-detail-item">
                            <Clock size={14} color="#333333" />
                            <span>Timing: <strong>{evt.time}</strong></span>
                          </div>

                          <div className="event-detail-item">
                            <MapPin size={14} color="#333333" />
                            <span>Location: <strong>Online / Arena</strong></span>
                          </div>

                          <div className="event-detail-item">
                            <Sparkles size={14} color="#333333" />
                            <span>Status: <strong>{evt.status || "Upcoming"}</strong></span>
                          </div>
                        </div>

                        {evt.tags && evt.tags.length > 0 && (
                          <div className="event-tags-container">
                            {evt.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                style={{
                                  fontSize: 11,
                                  padding: "2px 8px",
                                  borderRadius: 4,
                                  background: "rgba(255, 255, 255, 0.05)",
                                  border: "1px solid rgba(255, 255, 255, 0.1)",
                                  color: "#cbd5e1",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Tag size={10} /> {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="event-action-bar">
                          <button
                            type="button"
                            className="button button-secondary"
                            onClick={() => toggleCalendarReminder(evt.id)}
                            style={{ fontSize: 12, padding: "5px 12px" }}
                          >
                            <Bell size={13} color={evt.isReminderSet ? "#222222" : "currentColor"} />
                            {evt.isReminderSet ? "Reminder Set" : "Notify Me"}
                          </button>

                          {evt.link && evt.link !== "#" && (
                            <a
                              href={evt.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="button button-primary"
                              style={{
                                fontSize: 12,
                                padding: "5px 14px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                textDecoration: "none",
                              }}
                            >
                              <span>Open Registration</span>
                              <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>


      {isAddModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsAddModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-event-dialog-title"
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 id="add-event-dialog-title" style={{ margin: 0, fontSize: 17, color: "var(--color-primary)" }}>
                  Add Custom Event
                </h2>
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Schedule a private challenge, team round, or hackathon
                </span>
              </div>
              <button
                className="close-btn"
                onClick={() => setIsAddModalOpen(false)}
                type="button"
                aria-label="Close add event dialog"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="modalEvtTitle">Event Title *</label>
                  <input
                    id="modalEvtTitle"
                    className="form-input"
                    placeholder="e.g. Codeforces Round 995 (Div. 2)"
                    value={modalTitle}
                    onChange={(e) => setModalTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label htmlFor="modalEvtOrg">Platform / Organizer</label>
                    <input
                      id="modalEvtOrg"
                      className="form-input"
                      placeholder="e.g. Codeforces / LeetCode"
                      value={modalOrganizer}
                      onChange={(e) => setModalOrganizer(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="modalEvtType">Category</label>
                    <select
                      id="modalEvtType"
                      className="form-select"
                      value={modalType}
                      onChange={(e) => setModalType(e.target.value)}
                    >
                      <option value="Contest">Coding Contest</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Deadline">Application Deadline</option>
                      <option value="Workshop">Workshop</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label htmlFor="modalEvtDate">Event Date *</label>
                    <input
                      id="modalEvtDate"
                      type="date"
                      className="form-input"
                      value={modalDate}
                      onChange={(e) => setModalDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="modalEvtTime">Time / Duration</label>
                    <input
                      id="modalEvtTime"
                      className="form-input"
                      placeholder="e.g. 20:00 IST (2 hrs)"
                      value={modalTime}
                      onChange={(e) => setModalTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="modalEvtLink">Registration / Arena URL</label>
                  <input
                    id="modalEvtLink"
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={modalLink}
                    onChange={(e) => setModalLink(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modalEvtDesc">Description</label>
                  <textarea
                    id="modalEvtDesc"
                    className="form-textarea"
                    placeholder="Brief overview or syllabus..."
                    value={modalDescription}
                    onChange={(e) => setModalDescription(e.target.value)}
                    rows={3}
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
                  <Plus size={14} /> Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
