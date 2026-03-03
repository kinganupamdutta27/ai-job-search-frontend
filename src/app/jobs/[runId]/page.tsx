"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getWorkflowStatus } from "@/lib/api";
import Link from "next/link";

interface JobListing {
    title: string;
    company: string;
    location: string;
    url: string;
    source: string;
    description_snippet: string;
    hr_contacts: { name: string; email: string; source: string }[];
}

const sourceColors: Record<string, string> = {
    naukri: "#3b82f6",
    indeed: "#6366f1",
    linkedin: "#0a66c2",
    glassdoor: "#22c55e",
    google: "#f59e0b",
};

export default function JobsPage() {
    const params = useParams();
    const runId = params.runId as string;
    const [jobs, setJobs] = useState<JobListing[]>([]);
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getWorkflowStatus(runId);
                setStatus(data);
                setJobs(data.job_listings || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [runId]);

    if (loading) {
        return (
            <div className="fade-in" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "48px" }}>
                <span className="spinner" />
                <span style={{ color: "var(--text-muted)" }}>Loading job results...</span>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "4px" }}>
                        Job Search Results
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                        Run: {runId.slice(0, 8)}... — {jobs.length} jobs found
                    </p>
                </div>
                {status?.status === "awaiting_review" && (
                    <Link href={`/emails/${runId}`}>
                        <button className="btn-primary">✉️ Review Emails</button>
                    </Link>
                )}
            </div>

            {/* Source Summary */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
                {Object.entries(
                    jobs.reduce(
                        (acc, j) => ({ ...acc, [j.source]: (acc[j.source] || 0) + 1 }),
                        {} as Record<string, number>
                    )
                ).map(([source, count]) => (
                    <span
                        key={source}
                        className="badge"
                        style={{
                            background: `${sourceColors[source] || "#6b7280"}20`,
                            color: sourceColors[source] || "#6b7280",
                            border: `1px solid ${sourceColors[source] || "#6b7280"}50`,
                        }}
                    >
                        {source}: {count}
                    </span>
                ))}
            </div>

            {/* Job Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {jobs.map((job, i) => (
                    <div key={i} className="glass-card" style={{ padding: "20px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>
                                    {job.title}
                                </h3>
                                <div style={{ display: "flex", gap: "12px", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                                    <span>🏢 {job.company}</span>
                                    {job.location && <span>📍 {job.location}</span>}
                                </div>
                                {job.description_snippet && (
                                    <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5 }}>
                                        {job.description_snippet}
                                    </p>
                                )}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                                <span
                                    className="badge"
                                    style={{
                                        background: `${sourceColors[job.source] || "#6b7280"}20`,
                                        color: sourceColors[job.source] || "#6b7280",
                                        border: `1px solid ${sourceColors[job.source] || "#6b7280"}50`,
                                    }}
                                >
                                    {job.source}
                                </span>
                                <a href={job.url} target="_blank" rel="noopener noreferrer">
                                    <button className="btn-secondary" style={{ padding: "4px 10px", fontSize: "11px" }}>
                                        View Posting ↗
                                    </button>
                                </a>
                            </div>
                        </div>
                        {job.hr_contacts && job.hr_contacts.length > 0 && (
                            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)" }}>
                                <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
                                    HR CONTACTS:
                                </span>
                                <div style={{ display: "flex", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
                                    {job.hr_contacts.map((c, ci) => (
                                        <span key={ci} className="badge badge-info" style={{ fontSize: "11px" }}>
                                            {c.name} • {c.email} ({c.source})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
