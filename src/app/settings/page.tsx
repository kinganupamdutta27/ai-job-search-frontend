"use client";

import { useEffect, useState } from "react";
import {
    getSettings as fetchSettings,
    saveSettings,
    getSmtpGuide,
} from "@/lib/api";

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        openai_api_key: "",
        openai_model: "gpt-4o",
        langsmith_tracing: true,
        langsmith_endpoint: "https://api.smith.langchain.com",
        langsmith_api_key: "",
        langsmith_project: "JOBSEARCH",
        serp_api_key: "",
        tavily_api_key: "",
        smtp_host: "smtp.gmail.com",
        smtp_port: 587,
        smtp_email: "",
        smtp_password: "",
    });
    const [smtpGuide, setSmtpGuide] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showGuide, setShowGuide] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const [settingsData, guideData] = await Promise.all([
                    fetchSettings(),
                    getSmtpGuide(),
                ]);
                if (settingsData.settings) {
                    setSettings((prev) => ({
                        ...prev,
                        ...Object.fromEntries(
                            Object.entries(settingsData.settings).map(([k, v]) => [
                                k,
                                v as string,
                            ])
                        ),
                    }));
                }
                setSmtpGuide(guideData);
            } catch (err: any) {
                setError("Cannot connect to backend.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError("");
        try {
            await saveSettings(settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const updateField = (key: string, value: any) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div className="fade-in" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "48px" }}>
                <span className="spinner" />
                <span style={{ color: "var(--text-muted)" }}>Loading settings...</span>
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div>
                    <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "4px" }}>
                        Settings
                    </h1>
                    <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                        Configure your API keys, SMTP credentials, and platform preferences.
                    </p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    {saved && <span className="badge badge-success">✓ Saved</span>}
                    <button className="btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "💾 Save Settings"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="glass-card" style={{ padding: "12px 16px", marginBottom: "20px", borderColor: "rgba(239, 68, 68, 0.3)", color: "var(--danger)" }}>
                    ⚠️ {error}
                </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "800px" }}>
                {/* OpenAI Section */}
                <div className="glass-card" style={{ padding: "24px" }}>
                    <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        🤖 OpenAI Configuration
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                            <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                                API Key
                            </label>
                            <input
                                className="input-field"
                                type="password"
                                value={settings.openai_api_key}
                                onChange={(e) => updateField("openai_api_key", e.target.value)}
                                placeholder="sk-..."
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                                Model
                            </label>
                            <select
                                className="input-field"
                                value={settings.openai_model}
                                onChange={(e) => updateField("openai_model", e.target.value)}
                            >
                                <option value="gpt-4o">GPT-4o</option>
                                <option value="gpt-4o-mini">GPT-4o Mini</option>
                                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* LangSmith Section */}
                <div className="glass-card" style={{ padding: "24px" }}>
                    <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        📊 LangSmith Tracing
                    </h2>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                            <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                                API Key
                            </label>
                            <input
                                className="input-field"
                                type="password"
                                value={settings.langsmith_api_key}
                                onChange={(e) => updateField("langsmith_api_key", e.target.value)}
                                placeholder="ls-..."
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                                Project Name
                            </label>
                            <input
                                className="input-field"
                                value={settings.langsmith_project}
                                onChange={(e) => updateField("langsmith_project", e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Search APIs Section */}
                <div className="glass-card" style={{ padding: "24px" }}>
                    <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                        🔍 Search APIs
                    </h2>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px" }}>
                        Both engines run in parallel for maximum job coverage. Configure at least one.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                            <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                                SerpAPI Key{" "}
                                <a
                                    href="https://serpapi.com/"
                                    target="_blank"
                                    rel="noopener"
                                    style={{ color: "var(--accent-primary)", textDecoration: "none" }}
                                >
                                    (Get key →)
                                </a>
                            </label>
                            <input
                                className="input-field"
                                type="password"
                                value={settings.serp_api_key}
                                onChange={(e) => updateField("serp_api_key", e.target.value)}
                                placeholder="Google site: searches"
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                                Tavily API Key{" "}
                                <a
                                    href="https://tavily.com/"
                                    target="_blank"
                                    rel="noopener"
                                    style={{ color: "var(--accent-primary)", textDecoration: "none" }}
                                >
                                    (Get key →)
                                </a>
                            </label>
                            <input
                                className="input-field"
                                type="password"
                                value={settings.tavily_api_key}
                                onChange={(e) => updateField("tavily_api_key", e.target.value)}
                                placeholder="tvly-... (AI-optimized deep search)"
                            />
                        </div>
                    </div>
                </div>

                {/* SMTP Section */}
                <div className="glass-card" style={{ padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <h2 style={{ fontSize: "16px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                            📧 SMTP / Email Configuration
                        </h2>
                        <button
                            className="btn-secondary"
                            style={{ padding: "6px 14px", fontSize: "12px" }}
                            onClick={() => setShowGuide(!showGuide)}
                        >
                            {showGuide ? "Hide" : "📖 Gmail 2FA Guide"}
                        </button>
                    </div>

                    {showGuide && smtpGuide && (
                        <div
                            className="glass-card"
                            style={{
                                padding: "16px",
                                marginBottom: "16px",
                                background: "rgba(99, 102, 241, 0.05)",
                                borderColor: "var(--border-accent)",
                            }}
                        >
                            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px", color: "var(--accent-primary)" }}>
                                {smtpGuide.title}
                            </h3>
                            <ol style={{ paddingLeft: "20px", fontSize: "13px", color: "var(--text-secondary)", lineHeight: 2 }}>
                                {smtpGuide.steps.map((step: string, i: number) => (
                                    <li key={i}>{step.replace(/^\d+\.\s*/, "")}</li>
                                ))}
                            </ol>
                        </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                            <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                                SMTP Host
                            </label>
                            <input
                                className="input-field"
                                value={settings.smtp_host}
                                onChange={(e) => updateField("smtp_host", e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                                SMTP Port
                            </label>
                            <input
                                className="input-field"
                                type="number"
                                value={settings.smtp_port}
                                onChange={(e) => updateField("smtp_port", parseInt(e.target.value))}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                                Email Address
                            </label>
                            <input
                                className="input-field"
                                type="email"
                                value={settings.smtp_email}
                                onChange={(e) => updateField("smtp_email", e.target.value)}
                                placeholder="your-email@gmail.com"
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>
                                App Password (for 2FA)
                            </label>
                            <input
                                className="input-field"
                                type="password"
                                value={settings.smtp_password}
                                onChange={(e) => updateField("smtp_password", e.target.value)}
                                placeholder="16-character app password"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
