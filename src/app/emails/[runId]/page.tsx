"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getWorkflowStatus, submitReview } from "@/lib/api";

interface DraftEmail {
    id: string;
    to_email: string;
    to_name: string;
    subject: string;
    body_html: string;
    body_text: string;
    job_title: string;
    company: string;
    job_url: string;
    status: string;
}

export default function EmailReviewPage() {
    const params = useParams();
    const runId = params.runId as string;
    const [emails, setEmails] = useState<DraftEmail[]>([]);
    const [decisions, setDecisions] = useState<Record<string, boolean>>({});
    const [selectedEmail, setSelectedEmail] = useState<DraftEmail | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [reviewResult, setReviewResult] = useState<any>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getWorkflowStatus(runId);
                setEmails(data.draft_emails || []);
                // Default: all approved
                const defaults: Record<string, boolean> = {};
                (data.draft_emails || []).forEach((e: DraftEmail) => {
                    defaults[e.id] = true;
                });
                setDecisions(defaults);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [runId]);

    const handleSubmit = async () => {
        setSubmitting(true);
        setError("");
        try {
            const result = await submitReview(
                runId,
                Object.entries(decisions).map(([email_id, approved]) => ({
                    email_id,
                    approved,
                }))
            );
            setReviewResult(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const approvedCount = Object.values(decisions).filter(Boolean).length;
    const rejectedCount = Object.values(decisions).filter((v) => !v).length;

    if (loading) {
        return (
            <div className="fade-in" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "48px" }}>
                <span className="spinner" />
                <span style={{ color: "var(--text-muted)" }}>Loading email drafts...</span>
            </div>
        );
    }

    if (reviewResult) {
        return (
            <div className="fade-in" style={{ maxWidth: "600px", margin: "48px auto", textAlign: "center" }}>
                <div style={{ fontSize: "64px", marginBottom: "16px" }}>
                    {reviewResult.status === "completed" ? "✅" : "📤"}
                </div>
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>
                    {reviewResult.status === "completed"
                        ? "Emails Sent Successfully!"
                        : "Review Submitted"}
                </h1>
                <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
                    {reviewResult.approved_count} approved, {reviewResult.rejected_count}{" "}
                    rejected
                </p>
                {reviewResult.sent_results?.length > 0 && (
                    <div className="glass-card" style={{ padding: "16px", textAlign: "left" }}>
                        {reviewResult.sent_results.map((r: any, i: number) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    padding: "8px 0",
                                    borderBottom:
                                        i < reviewResult.sent_results.length - 1
                                            ? "1px solid var(--border-subtle)"
                                            : "none",
                                }}
                            >
                                <span style={{ fontSize: "13px" }}>
                                    {r.email_id.slice(0, 8)}...
                                </span>
                                <span className={`badge ${r.success ? "badge-success" : "badge-danger"}`}>
                                    {r.success ? "Sent" : "Failed"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
                <a href="/">
                    <button className="btn-primary" style={{ marginTop: "24px" }}>
                        Back to Dashboard
                    </button>
                </a>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "4px" }}>
                        Review Email Drafts
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                        {emails.length} emails generated — approve or reject each before
                        sending.
                    </p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span className="badge badge-success">{approvedCount} Approved</span>
                    <span className="badge badge-danger">{rejectedCount} Rejected</span>
                    <button
                        className="btn-primary"
                        onClick={handleSubmit}
                        disabled={submitting || approvedCount === 0}
                    >
                        {submitting ? (
                            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span className="spinner" /> Sending...
                            </span>
                        ) : (
                            `📤 Send ${approvedCount} Emails`
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div
                    className="glass-card"
                    style={{
                        padding: "12px 16px",
                        marginBottom: "16px",
                        borderColor: "rgba(239, 68, 68, 0.3)",
                        color: "var(--danger)",
                    }}
                >
                    ⚠️ {error}
                </div>
            )}

            {/* Bulk Actions */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <button
                    className="btn-secondary"
                    style={{ padding: "6px 14px", fontSize: "12px" }}
                    onClick={() => {
                        const all: Record<string, boolean> = {};
                        emails.forEach((e) => (all[e.id] = true));
                        setDecisions(all);
                    }}
                >
                    ✅ Approve All
                </button>
                <button
                    className="btn-secondary"
                    style={{ padding: "6px 14px", fontSize: "12px" }}
                    onClick={() => {
                        const all: Record<string, boolean> = {};
                        emails.forEach((e) => (all[e.id] = false));
                        setDecisions(all);
                    }}
                >
                    ❌ Reject All
                </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Email List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {emails.map((email) => (
                        <div
                            key={email.id}
                            className="glass-card"
                            style={{
                                padding: "16px",
                                cursor: "pointer",
                                borderColor:
                                    selectedEmail?.id === email.id
                                        ? "var(--accent-primary)"
                                        : undefined,
                            }}
                            onClick={() => setSelectedEmail(email)}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
                                        {email.subject}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                                        To: {email.to_name} &lt;{email.to_email}&gt;
                                    </div>
                                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                                        {email.job_title} @ {email.company}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "4px" }}>
                                    <button
                                        className={decisions[email.id] ? "btn-success" : "btn-secondary"}
                                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDecisions({ ...decisions, [email.id]: true });
                                        }}
                                    >
                                        ✓
                                    </button>
                                    <button
                                        className={!decisions[email.id] ? "btn-danger" : "btn-secondary"}
                                        style={{ padding: "4px 8px", fontSize: "11px", borderRadius: "6px" }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDecisions({ ...decisions, [email.id]: false });
                                        }}
                                    >
                                        ✗
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Email Preview */}
                <div className="glass-card" style={{ padding: "24px", position: "sticky", top: "32px", maxHeight: "80vh", overflow: "auto" }}>
                    {selectedEmail ? (
                        <>
                            <div style={{ marginBottom: "16px" }}>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                                    SUBJECT
                                </div>
                                <div style={{ fontSize: "16px", fontWeight: 600 }}>
                                    {selectedEmail.subject}
                                </div>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
                                <div>
                                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>TO</div>
                                    <div style={{ fontSize: "13px" }}>
                                        {selectedEmail.to_name} &lt;{selectedEmail.to_email}&gt;
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>JOB</div>
                                    <div style={{ fontSize: "13px" }}>
                                        {selectedEmail.job_title} @ {selectedEmail.company}
                                    </div>
                                </div>
                            </div>
                            <div
                                style={{
                                    borderTop: "1px solid var(--border-subtle)",
                                    paddingTop: "16px",
                                }}
                            >
                                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "8px" }}>
                                    EMAIL PREVIEW
                                </div>
                                <div
                                    style={{
                                        background: "#fff",
                                        borderRadius: "8px",
                                        padding: "20px",
                                        color: "#333",
                                        fontSize: "14px",
                                        lineHeight: 1.6,
                                    }}
                                    dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                                />
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: "center", padding: "48px", color: "var(--text-muted)" }}>
                            <div style={{ fontSize: "48px", marginBottom: "12px" }}>✉️</div>
                            Click an email to preview
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
