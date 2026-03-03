"use client";

import { useEffect, useState } from "react";
import { getTemplate, updateTemplate } from "@/lib/api";

export default function TemplatesPage() {
    const [template, setTemplate] = useState("");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);

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

    return (
        <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "4px" }}>
                        Email Templates
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                        Customize the base HTML email template. Available placeholders:{" "}
                        <code style={{ color: "var(--accent-primary)" }}>
                            {"{{greeting}}, {{body}}, {{skills_highlight}}, {{closing}}, {{sender_name}}, {{sender_email}}, {{sender_phone}}"}
                        </code>
                    </p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {saved && <span className="badge badge-success">✓ Saved</span>}
                    <button className="btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "💾 Save Template"}
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {/* Editor */}
                <div className="glass-card" style={{ padding: "20px" }}>
                    <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "8px", display: "block" }}>
                        HTML TEMPLATE
                    </label>
                    {loading ? (
                        <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)" }}>
                            <span className="spinner" />
                        </div>
                    ) : (
                        <textarea
                            className="input-field"
                            style={{
                                minHeight: "500px",
                                fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                                fontSize: "12px",
                                lineHeight: 1.6,
                                resize: "vertical",
                            }}
                            value={template}
                            onChange={(e) => setTemplate(e.target.value)}
                        />
                    )}
                </div>

                {/* Preview */}
                <div className="glass-card" style={{ padding: "20px" }}>
                    <label style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600, marginBottom: "8px", display: "block" }}>
                        LIVE PREVIEW
                    </label>
                    <div
                        style={{
                            background: "#fff",
                            borderRadius: "8px",
                            padding: "20px",
                            minHeight: "500px",
                            color: "#333",
                            fontSize: "14px",
                        }}
                        dangerouslySetInnerHTML={{
                            __html: template
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
                                .replace(
                                    /\{\{\s*sender_email\s*\}\}/g,
                                    "anupam@example.com"
                                )
                                .replace(/\{\{\s*sender_phone\s*\}\}/g, "+91 98765 43210"),
                        }}
                    />
                </div>
            </div>

            {/* Role-Specific Guidance */}
            <div className="glass-card" style={{ padding: "24px", marginTop: "24px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>
                    Role-Specific Email Customization
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "16px" }}>
                    The AI automatically adjusts email content based on the job role. Here are the built-in role profiles:
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
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
