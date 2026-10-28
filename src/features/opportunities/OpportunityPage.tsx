import { Search, SlidersHorizontal } from "lucide-react";
import { upcomingOpportunities } from "../../shared/data/sampleData";

export function OpportunityPage() {
  return (
    <main className="page-content">
      <div className="page-heading">
        <div><p className="eyebrow">Opportunity hub</p><h1>Find your next move</h1><p className="muted">Search internships, research roles, hackathons, and more.</p></div>
      </div>
      <div className="search-bar"><Search size={19} /><input placeholder="Try “paid ML internships for second-year students”" /><button className="button button-primary">Search</button></div>
      <div className="filter-row"><span className="muted">24 results</span><button className="button button-secondary"><SlidersHorizontal size={16} /> Filters</button></div>
      <div className="opportunity-cards">
        {upcomingOpportunities.map((opportunity) => (
          <article className="opportunity-card" key={opportunity.id}>
            <div className="company-mark">{opportunity.company.slice(0, 1)}</div>
            <div className="card-body"><span className="tag">{opportunity.type}</span><h2>{opportunity.title}</h2><p>{opportunity.company} · {opportunity.location}</p><div className="card-footer"><span>Deadline {opportunity.deadline}</span><button className="text-button">View details →</button></div></div>
          </article>
        ))}
      </div>
    </main>
  );
}
