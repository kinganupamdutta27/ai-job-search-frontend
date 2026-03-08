"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ContactResult {
  company: string;
  domain: string;
  name: string;
  email: string;
  role: string;
  source: string;
  is_new: boolean;
}

interface FinderRun {
  id: string;
  prompt: string;
  status: string;
  contacts_found: number;
  companies_found: number;
  created_at: string | null;
}

export default function ContactFinderPage() {
  const [prompt, setPrompt] = useState("");
  const [maxCompanies, setMaxCompanies] = useState(20);
  const [runId, setRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");
  const [contacts, setContacts] = useState<ContactResult[]>([]);
  const [companiesFound, setCompaniesFound] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pastRuns, setPastRuns] = useState<FinderRun[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const startSearch = async () => {
    if (!prompt.trim()) return;
    setError("");
    setLoading(true);
    setContacts([]);
    setCompaniesFound(0);
    setStatus("running");

    try {
      const res = await fetch(`${API}/api/contact-finder/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, max_companies: maxCompanies }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || "Failed to start search");
      }
      const data = await res.json();
      setRunId(data.run_id);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      setStatus("");
    }
  };

  // Poll for results when we have a runId
  useEffect(() => {
    if (!runId) return;
    let cancelled = false;

    const poll = async () => {
      while (!cancelled) {
        try {
          const res = await fetch(`${API}/api/contact-finder/${runId}/status`);
          const data = await res.json();
          setStatus(data.status);
          setCompaniesFound(data.companies_found || 0);

          if (data.status === "completed" || data.status === "failed") {
            if (data.results?.contacts) {
              setContacts(data.results.contacts);
            }
            if (data.results?.error) {
              setError(data.results.error);
            }
            setLoading(false);
            break;
          }
        } catch {
          // keep polling
        }
        await new Promise((r) => setTimeout(r, 3000));
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [runId]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/api/contact-finder/runs`);
      const data = await res.json();
      setPastRuns(data.runs || []);
    } catch {
      // ignore
    }
  };

  const loadRun = async (id: string) => {
    setRunId(id);
    setLoading(true);
    setShowHistory(false);
    try {
      const res = await fetch(`${API}/api/contact-finder/${id}/status`);
      const data = await res.json();
      setPrompt(data.prompt || "");
      setStatus(data.status);
      setCompaniesFound(data.companies_found || 0);
      setContacts(data.results?.contacts || []);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (contacts.length === 0) return;
    const header = "Company,Domain,Name,Email,Role,Source\n";
    const rows = contacts.map((c) =>
      [c.company, c.domain, c.name, c.email, c.role, c.source]
        .map((v) => `"${(v || "").replace(/"/g, '""')}"`)
        .join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contacts_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sourceColor: Record<string, string> = {
    contact_finder: "#6366f1",
    extracted: "#22c55e",
    ai_inferred: "#3b82f6",
    pattern: "#f59e0b",
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.3rem" }}>
            Contact Finder
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Search for HR, VP, and recruiter emails from any companies using AI-powered web search.
          </p>
        </div>
        <button
          onClick={() => { setShowHistory(!showHistory); if (!showHistory) fetchHistory(); }}
          className="btn-secondary"
          style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}
        >
          {showHistory ? "Hide History" : "Past Searches"}
        </button>
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="glass-card" style={{ padding: "1rem", marginBottom: "1.5rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.75rem" }}>Past Searches</h3>
          {pastRuns.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No past searches found.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {pastRuns.map((r) => (
                <div
                  key={r.id}
                  onClick={() => loadRun(r.id)}
                  style={{
                    padding: "0.6rem 1rem",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.03)",
                    cursor: "pointer",
                    border: "1px solid var(--border-subtle)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}
                >
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>{r.prompt}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      {r.contacts_found} contacts from {r.companies_found} companies
                    </div>
                  </div>
                  <span
                    style={{
                      padding: "2px 10px",
                      borderRadius: 12,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      background: r.status === "completed" ? "#1e3a1e" : r.status === "running" ? "#1e1e3a" : "#3a1e1e",
                      color: r.status === "completed" ? "#22c55e" : r.status === "running" ? "#60a5fa" : "#f87171",
                    }}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Form */}
      <div className="glass-card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <label style={{ fontWeight: 600, fontSize: "0.9rem", display: "block", marginBottom: "0.5rem" }}>
          Search Prompt
        </label>
        <textarea
          className="input-field"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Find HR and VP emails of all IT companies and tech companies from Kolkata"
          rows={3}
          style={{ width: "100%", resize: "vertical", marginBottom: "1rem" }}
        />

        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
              Max Companies
            </label>
            <input
              type="number"
              className="input-field"
              value={maxCompanies}
              onChange={(e) => setMaxCompanies(Math.max(1, Math.min(100, Number(e.target.value))))}
              min={1}
              max={100}
              style={{ width: 100 }}
            />
          </div>
          <button
            className="btn-primary"
            onClick={startSearch}
            disabled={loading || !prompt.trim()}
            style={{ height: 40 }}
          >
            {loading ? "Searching..." : "Start Search"}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      {status && (
        <div
          className="glass-card"
          style={{
            padding: "0.75rem 1.2rem",
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {loading && <span className="spinner" />}
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>
              Status: {status}
            </span>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            {companiesFound} companies &middot; {contacts.length} contacts
          </div>
        </div>
      )}

      {error && (
        <div style={{ padding: "0.75rem 1rem", borderRadius: 8, background: "#3a1e1e", color: "#f87171", marginBottom: "1rem", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}

      {/* Results Table */}
      {contacts.length > 0 && (
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>
              Results ({contacts.length} contacts)
            </h3>
            <button className="btn-secondary" onClick={exportCSV} style={{ fontSize: "0.8rem" }}>
              Export CSV
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border-subtle)", textAlign: "left" }}>
                  <th style={{ padding: 8, color: "var(--text-muted)", fontSize: "0.8rem" }}>Company</th>
                  <th style={{ padding: 8, color: "var(--text-muted)", fontSize: "0.8rem" }}>Domain</th>
                  <th style={{ padding: 8, color: "var(--text-muted)", fontSize: "0.8rem" }}>Name</th>
                  <th style={{ padding: 8, color: "var(--text-muted)", fontSize: "0.8rem" }}>Email</th>
                  <th style={{ padding: 8, color: "var(--text-muted)", fontSize: "0.8rem" }}>Role</th>
                  <th style={{ padding: 8, color: "var(--text-muted)", fontSize: "0.8rem" }}>Source</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: 8, fontWeight: 500 }}>{c.company}</td>
                    <td style={{ padding: 8, color: "var(--text-muted)", fontSize: "0.85rem" }}>{c.domain}</td>
                    <td style={{ padding: 8 }}>{c.name}</td>
                    <td style={{ padding: 8, color: "#60a5fa" }}>{c.email}</td>
                    <td style={{ padding: 8, color: "var(--text-secondary)" }}>{c.role}</td>
                    <td style={{ padding: 8 }}>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          background: `${sourceColor[c.source] || "#666"}22`,
                          color: sourceColor[c.source] || "#666",
                        }}
                      >
                        {c.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
