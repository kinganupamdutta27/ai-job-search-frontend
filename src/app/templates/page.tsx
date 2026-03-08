"use client";

import { useEffect, useState } from "react";
import { getTemplate, updateTemplate } from "@/lib/api";

function renderPreview(html: string): string {
    return html
        .replace(/\{\{\s*greeting\s*\}\}/g, "Dear Priya Sharma,")
        .replace(
            /\{\{\s*body\s*\}\}/g,
            "I am writing to express my strong interest in the Python Developer position at your esteemed organization. With over 5 years of experience in Python development, including expertise in FastAPI, Django, and cloud technologies, I am confident in my ability to contribute meaningfully to your team."
        )
        .replace(
            /\{\{\s*skills_highlight\s*\}\}/g,
            "Python, FastAPI, Django, PostgreSQL, Docker, AWS"
        )
        .replace(
            /\{\{\s*closing\s*\}\}/g,
            "I look forward to the opportunity to discuss how my skills and experience can benefit your team. Thank you for considering my application."
        )
        .replace(/\{\{\s*sender_name\s*\}\}/g, "Anupam Dutta")
        .replace(/\{\{\s*sender_email\s*\}\}/g, "anupam@example.com")
        .replace(/\{\{\s*sender_phone\s*\}\}/g, "+91 98765 43210")
        // Strip Jinja control flow so preview renders clean
        .replace(/\{%.*?%\}/gs, "");
}

export default function TemplatesPage() {
    const [template, setTemplate] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const data = await getTemplate("default");
                setTemplate(data.html_content);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTemplate();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateTemplate("default", template);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const placeholders = [
        "{{greeting}}", "{{body}}", "{{skills_highlight}}",
        "{{closing}}", "{{sender_name}}", "{{sender_email}}", "{{sender_phone}}",
    ];

    return (
        <div className="fade-in">
            {/* ── Header ──────────────────────────────────────────── */}
            <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
                        Email Templates
                    </h1>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                        {saved && <span className="badge badge-success">✓ Saved</span>}
                        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ whiteSpace: "nowrap" }}>
                            {saving ? "Saving..." : "💾 Save Template"}
                        </button>
                    </div>
                </div>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", margin: 0 }}>
                    Customize the base HTML email template used for outreach.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                    {placeholders.map((p) => (
                        <code
                            key={p}
                            style={{
                                fontSize: "11px",
                                background: "var(--accent-glow)",
                                color: "var(--accent-primary)",
                                padding: "2px 8px",
                                borderRadius: "6px",
                                border: "1px solid var(--border-accent)",
                            }}
                        >
                            {p}
                        </code>
                    ))}
                </div>
            </div>

            {/* ── Tab Switcher (visible on smaller viewports, always usable) ── */}
            <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
                {(["editor", "preview"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: "8px 20px",
                            borderRadius: "10px",
                            border: "1px solid",
                            borderColor: activeTab === tab ? "var(--accent-primary)" : "var(--border-subtle)",
                            background: activeTab === tab ? "var(--accent-glow)" : "transparent",
                            color: activeTab === tab ? "var(--accent-primary)" : "var(--text-secondary)",
                            fontWeight: 600,
                            fontSize: "13px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                        }}
                    >
                        {tab === "editor" ? "✏️ Editor" : "👁️ Preview"}
                    </button>
                ))}
            </div>

            {/* ── Editor / Preview Panel ──────────────────────────── */}
            <div className="glass-card" style={{ padding: "20px", marginBottom: "24px" }}>
                {activeTab === "editor" ? (
                    <>
                        <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "8px", display: "block", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            HTML Template
                        </label>
                        {loading ? (
                            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                                <span className="spinner" />
                            </div>
                        ) : (
                            <textarea
                                className="input-field"
                                style={{
                                    minHeight: "520px",
                                    fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace",
                                    fontSize: "13px",
                                    lineHeight: 1.7,
                                    resize: "vertical",
                                    whiteSpace: "pre",
                                    overflowX: "auto",
                                    tabSize: 2,
                                }}
                                value={template}
                                onChange={(e) => setTemplate(e.target.value)}
                                spellCheck={false}
                            />
                        )}
                    </>
                ) : (
                    <>
                        <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "8px", display: "block", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            Live Preview
                        </label>
                        <iframe
                            srcDoc={renderPreview(template)}
                            style={{
                                width: "100%",
                                minHeight: "520px",
                                height: "600px",
                                border: "none",
                                borderRadius: "10px",
                                background: "#ffffff",
                            }}
                            sandbox="allow-same-origin"
                            title="Email preview"
                        />
                    </>
                )}
            </div>

            {/* ── Role-Specific Guidance ──────────────────────────── */}
            <div className="glass-card" style={{ padding: "24px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "6px" }}>
                    Role-Specific Email Customization
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "16px" }}>
                    The AI automatically adjusts email content based on the job role.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
                    {[
                        { role: "Python Developer", emoji: "🐍", tone: "Technical & confident" },
                        { role: "GenAI Developer", emoji: "🤖", tone: "Innovative & forward-thinking" },
                        { role: "Data Scientist", emoji: "📊", tone: "Analytical & data-driven" },
                        { role: "Full-Stack Dev", emoji: "⚡", tone: "Versatile & solution-oriented" },
                        { role: "DevOps Engineer", emoji: "🔧", tone: "Reliability-focused" },
                        { role: "Backend Dev", emoji: "🏗️", tone: "Architectural & performance-minded" },
                    ].map((r) => (
                        <div key={r.role} className="glass-card" style={{ padding: "14px" }}>
                            <div style={{ fontSize: "20px", marginBottom: "4px" }}>{r.emoji}</div>
                            <div style={{ fontSize: "13px", fontWeight: 600 }}>{r.role}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{r.tone}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
