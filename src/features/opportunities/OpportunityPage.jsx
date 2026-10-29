import {
  Bookmark,
  ArrowRight,
  Calendar,
  Filter,
  MapPin,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAppContext } from "../../shared/context/AppContext.jsx";
import { parseNaturalLanguageQuery } from "../assistant/services/aiAssistantService.js";
import { OpportunityDetailModal } from "./OpportunityDetailModal.jsx";

export function OpportunityPage() {
  const {
    opportunities,
    savedOpportunityIds,
    toggleSaveOpportunity,
    profile,
    setSelectedOpportunityForAnalysis,
    setActivePage,
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [sortBy, setSortBy] = useState("deadline");
  const [viewTab, setViewTab] = useState("all");
  const [activeModalOpportunity, setActiveModalOpportunity] = useState(null);

  // Handle Natural Language Search trigger
  const handleNLSearch = () => {
    if (!searchQuery.trim()) return;
    const parsed = parseNaturalLanguageQuery(searchQuery);
    if (parsed.detectedType !== "All") setSelectedType(parsed.detectedType);
    if (parsed.detectedLocation !== "All") setSelectedLocation(parsed.detectedLocation);
  };

  const studentSkillsLower = useMemo(
    () => profile.skills.map((s) => s.toLowerCase()),
    [profile.skills],
  );

  const filteredOpportunities = useMemo(() => {
    return opportunities
      .filter((opp) => {
        // Tab filtering
        if (viewTab === "saved" && !savedOpportunityIds.includes(opp.id)) {
          return false;
        }

        // Search text matching (title, company, skills, description)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = opp.title.toLowerCase().includes(q);
          const matchesCompany = opp.company.toLowerCase().includes(q);
          const matchesSkills = opp.skills.some((s) => s.toLowerCase().includes(q));
          const matchesDesc = opp.description.toLowerCase().includes(q);
          if (!matchesTitle && !matchesCompany && !matchesSkills && !matchesDesc) {
            return false;
          }
        }

        // Type filter
        if (selectedType !== "All" && opp.type !== selectedType) {
          return false;
        }

        // Location filter
        if (selectedLocation !== "All" && opp.locationType !== selectedLocation) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "deadline") {
          return a.deadlineDate.localeCompare(b.deadlineDate);
        }
        return a.title.localeCompare(b.title);
      });
  }, [opportunities, savedOpportunityIds, viewTab, searchQuery, selectedType, selectedLocation, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedType("All");
    setSelectedLocation("All");
    setSortBy("deadline");
  };

  return (
    <main className="page-content">
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">Explore</p>
          <h1>Find your next opportunity</h1>
          <p className="muted">Internships, research, and events selected for students.</p>
        </div>
      </div>

      {/* Natural Language & Keyword Search Bar */}
      <form
        className="search-container"
        onSubmit={(e) => {
          e.preventDefault();
          handleNLSearch();
        }}
      >
        <div className="search-bar">
          <Search size={19} />
          <input
            placeholder="Search keywords or try “paid ML internships for sophomore”..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-button"
              style={{ color: "var(--color-text-muted)" }}
            >
              Clear
            </button>
          )}
        </div>
        <button className="button button-primary" type="submit">
          Search
        </button>
      </form>

      {/* Tabs: All vs Saved */}
      <div className="tab-bar">
        <button
          className={`tab-btn ${viewTab === "all" ? "active" : ""}`}
          onClick={() => setViewTab("all")}
          type="button"
        >
          All Opportunities ({opportunities.length})
        </button>
        <button
          className={`tab-btn ${viewTab === "saved" ? "active" : ""}`}
          onClick={() => setViewTab("saved")}
          type="button"
        >
          Saved Roles ({savedOpportunityIds.length})
        </button>
      </div>

      {/* Filter Row */}
      <div className="filter-row">
        <span className="muted">
          Showing <strong>{filteredOpportunities.length}</strong> {viewTab === "saved" ? "saved " : ""}results
        </span>

        <div className="filter-group">
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Filter size={15} color="var(--color-text-muted)" />
            <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Type:</span>
          </div>
          <select
            className="filter-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Internship">Internship</option>
            <option value="Research">Research</option>
            <option value="Hackathon">Hackathon</option>
            <option value="Full-time">Full-time</option>
          </select>

          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Location:</span>
          <select
            className="filter-select"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="All">All Locations</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </select>

          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Sort by:</span>
          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="deadline">Deadline (Earliest)</option>
            <option value="title">Role Title (A-Z)</option>
          </select>

          {(selectedType !== "All" || selectedLocation !== "All" || searchQuery) && (
            <button className="text-button" onClick={clearFilters} type="button">
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Opportunity Cards Grid */}
      {filteredOpportunities.length === 0 ? (
        <div
          className="panel"
          style={{ textAlign: "center", padding: "48px 20px", color: "var(--color-text-muted)" }}
        >
          <XCircle size={40} style={{ margin: "0 auto 12px", opacity: 0.5 }} />
          <h3 style={{ margin: "0 0 6px", color: "var(--color-primary)" }}>No matching opportunities</h3>
          <p style={{ margin: "0 0 16px", fontSize: 13.5 }}>
            {viewTab === "saved"
              ? "You haven't saved any opportunities matching this filter yet."
              : "Try relaxing your search terms or clearing active filters."}
          </p>
          <button className="button button-secondary button-sm" onClick={clearFilters} type="button">
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="opportunity-cards">
          {filteredOpportunities.map((opportunity) => {
            const isSaved = savedOpportunityIds.includes(opportunity.id);

            return (
              <article className="opportunity-card" key={opportunity.id}>
                <div className="card-top">
                  <div className="card-top-left">
                    <div className="company-mark">{opportunity.company.slice(0, 1)}</div>
                    <div>
                      <span className={`tag tag-${opportunity.type.toLowerCase()}`}>
                        {opportunity.type}
                      </span>
                    </div>
                  </div>
                  <button
                    className={`icon-btn ${isSaved ? "active" : ""}`}
                    onClick={() => toggleSaveOpportunity(opportunity.id)}
                    title={isSaved ? "Remove from saved" : "Save opportunity"}
                    type="button"
                    aria-label="Save opportunity"
                  >
                    <Bookmark size={16} fill={isSaved ? "currentColor" : "none"} />
                  </button>
                </div>

                <div className="card-body">
                  <h2>{opportunity.title}</h2>
                  <p className="company-sub">
                    <strong>{opportunity.company}</strong><span className="role-location"><MapPin size={12} /> {opportunity.location}</span>
                  </p>
                  <span className="stipend-tag">{opportunity.stipend}</span>
                  <div className="skills-chips role-skills">
                    {opportunity.skills.slice(0, 3).map((skill) => {
                      const isMatched = studentSkillsLower.includes(skill.toLowerCase());
                      return (
                        <span
                          key={skill}
                          className={`skill-chip ${isMatched ? "matched" : ""}`}
                        >
                          {isMatched && "✓ "}
                          {skill}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="card-footer">
                  <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <Calendar size={13} /> Deadline {opportunity.deadline}
                  </span>
                  <div className="card-actions">
                    <button
                      className="button button-secondary button-sm"
                      onClick={() => {
                        setSelectedOpportunityForAnalysis(opportunity);
                        setActivePage("assistant");
                      }}
                      title="Compare your skills with this role"
                      type="button"
                    >
                      <Sparkles size={13} /> Fit
                    </button>
                    <button
                      className="button button-primary button-sm"
                      onClick={() => setActiveModalOpportunity(opportunity)}
                      type="button"
                    >
                      View role <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Details Modal */}
      <OpportunityDetailModal
        opportunity={activeModalOpportunity}
        onClose={() => setActiveModalOpportunity(null)}
      />
    </main>
  );
}

