"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listRuns, healthCheck } from "@/lib/api";

interface WorkflowRun {
  run_id: string;
  status: string;
  current_step: string;
  jobs_found: number;
  emails_generated: number;
}

interface HealthStatus {
  openai_configured: boolean;
  serpapi_configured: boolean;
  tavily_configured: boolean;
  smtp_configured: boolean;
  langsmith_configured: boolean;
}

const stepLabels: Record<string, string> = {
  starting: "Starting...",
  analyzing_cv: "Analyzing CV",
  cv_analyzed: "CV Analyzed",
  searching_jobs: "Searching Jobs",
  jobs_searched: "Jobs Found",
  extracting_contacts: "Extracting HR Contacts",
  contacts_extracted: "Contacts Extracted",
  generating_emails: "Generating Emails",
  emails_generated: "Emails Generated",
  awaiting_review: "Awaiting Your Review",
  review_complete: "Review Complete",
  sending_emails: "Sending Emails",
  completed: "Completed",
  failed: "Failed",
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    running: "badge-info",
    awaiting_review: "badge-warning",
    completed: "badge-success",
    failed: "badge-danger",
    sending: "badge-info",
  };
  return (
    <span className={`badge ${styles[status] || "badge-neutral"}`}>
      {status === "running" && <span className="pulse-dot" style={{ background: "var(--info)" }} />}
      {status === "awaiting_review" && <span className="pulse-dot" style={{ background: "var(--warning)" }} />}
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default function DashboardPage() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [runsData, healthData] = await Promise.all([
          listRuns(),
          healthCheck(),
        ]);
        setRuns(runsData.runs || []);
        setHealth(healthData);
        setApiError("");
      } catch (err: any) {
        setApiError(
          "Cannot connect to backend. Make sure the FastAPI server is running on localhost:8000."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>
        Dashboard
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
        AI-powered job search and email outreach automation
      </p>

      {apiError && (
        <div
          className="glass-card"
          style={{
            padding: "16px 20px",
            marginBottom: "24px",
            borderColor: "rgba(239, 68, 68, 0.3)",
            background: "rgba(239, 68, 68, 0.05)",
          }}
        >
          <span style={{ color: "var(--danger)" }}>⚠️ {apiError}</span>
        </div>
      )}

      {/* Status Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {[
          {
            label: "OpenAI",
            ok: health?.openai_configured,
            icon: "🤖",
          },
          {
            label: "SerpAPI",
            ok: health?.serpapi_configured,
            icon: "🔍",
          },
          {
            label: "Tavily",
            ok: health?.tavily_configured,
            icon: "🟣",
          },
          { label: "SMTP", ok: health?.smtp_configured, icon: "📧" },
          {
            label: "LangSmith",
            ok: health?.langsmith_configured,
            icon: "📊",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="glass-card"
            style={{ padding: "20px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: "28px" }}>{item.icon}</span>
              <span
                className={`badge ${item.ok ? "badge-success" : "badge-danger"}`}
              >
                {item.ok ? "Active" : "Not Set"}
              </span>
            </div>
            <div
              style={{
                marginTop: "12px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "32px",
        }}
      >
        <Link href="/cv">
          <button className="btn-primary">📄 Upload CV & Start</button>
        </Link>
        <Link href="/settings">
          <button className="btn-secondary">⚙️ Configure API Keys</button>
        </Link>
      </div>

      {/* Workflow Runs */}
      <div className="glass-card" style={{ padding: "24px" }}>
        <h2
          style={{
            fontSize: "18px",
            fontWeight: 600,
            marginBottom: "16px",
          }}
        >
          Workflow Runs
        </h2>

        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "24px",
              color: "var(--text-muted)",
            }}
          >
            <span className="spinner" />
            Loading...
          </div>
        ) : runs.length === 0 ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "var(--text-muted)",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🚀</div>
            <p>No workflow runs yet.</p>
            <p style={{ fontSize: "13px" }}>
              Upload your CV to start the job search automation.
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>Status</th>
                <th>Step</th>
                <th>Jobs</th>
                <th>Emails</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.run_id}>
                  <td style={{ fontFamily: "monospace", fontSize: "12px" }}>
                    {run.run_id.slice(0, 8)}...
                  </td>
                  <td>
                    <StatusBadge status={run.status} />
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>
                    {stepLabels[run.current_step] || run.current_step}
                  </td>
                  <td>{run.jobs_found}</td>
                  <td>{run.emails_generated}</td>
                  <td>
                    <Link href={`/jobs/${run.run_id}`}>
                      <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
                        View
                      </button>
                    </Link>
                    {run.status === "awaiting_review" && (
                      <Link href={`/emails/${run.run_id}`}>
                        <button
                          className="btn-primary"
                          style={{
                            padding: "6px 12px",
                            fontSize: "12px",
                            marginLeft: "8px",
                          }}
                        >
                          Review Emails
                        </button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
