"use client";

import { useEffect, useState } from "react";

interface Contact {
    id: string;
    name: string;
    email: string;
    role: string;
    source: string;
    verified: boolean;
    company_name: string | null;
    company_domain: string | null;
    created_at: string | null;
}

interface Company {
    id: string;
    name: string;
    domain: string;
    industry: string | null;
    contact_count: number;
    created_at: string | null;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [view, setView] = useState<"contacts" | "companies">("companies");
    const [filterDomain, setFilterDomain] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchContacts = async (domain?: string) => {
        setLoading(true);
        const url = domain
            ? `${API}/api/contacts?domain=${encodeURIComponent(domain)}`
            : `${API}/api/contacts`;
        const res = await fetch(url);
        const data = await res.json();
        setContacts(data.contacts || []);
        setLoading(false);
    };

    const fetchCompanies = async () => {
        setLoading(true);
        const res = await fetch(`${API}/api/contacts/companies`);
        const data = await res.json();
        setCompanies(data.companies || []);
        setLoading(false);
    };

    const deleteContact = async (id: string) => {
        await fetch(`${API}/api/contacts/${id}`, { method: "DELETE" });
        setContacts((prev) => prev.filter((c) => c.id !== id));
    };

    useEffect(() => {
        if (view === "companies") fetchCompanies();
        else fetchContacts(filterDomain || undefined);
    }, [view]);

    const drillDown = (domain: string) => {
        setFilterDomain(domain);
        setView("contacts");
        fetchContacts(domain);
    };

    const sourceColor: Record<string, string> = {
        extracted: "#22c55e",
        ai_inferred: "#3b82f6",
        pattern: "#f59e0b",
        fallback: "#ef4444",
    };

    return (
        <main style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto", fontFamily: "'Inter', sans-serif" }}>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                📇 HR Contact Database
            </h1>
            <p style={{ color: "#888", marginBottom: "1.5rem" }}>
                All discovered HR contacts, grouped by company domain.
            </p>

            {/* Tab Switcher */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                {(["companies", "contacts"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => {
                            setView(tab);
                            setFilterDomain("");
                        }}
                        style={{
                            padding: "0.5rem 1.2rem",
                            borderRadius: 8,
                            border: "none",
                            background: view === tab ? "#6366f1" : "#1e1e2e",
                            color: view === tab ? "#fff" : "#aaa",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: "0.9rem",
                        }}
                    >
                        {tab === "companies" ? "🏢 Companies" : "👤 Contacts"}
                    </button>
                ))}
                {filterDomain && (
                    <span
                        style={{
                            padding: "0.5rem 1rem",
                            borderRadius: 8,
                            background: "#312e81",
                            color: "#a5b4fc",
                            fontSize: "0.85rem",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        Filtered: {filterDomain}
                        <button
                            onClick={() => { setFilterDomain(""); fetchContacts(); }}
                            style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontWeight: 700 }}
                        >
                            ✕
                        </button>
                    </span>
                )}
            </div>

            {loading ? (
                <p style={{ color: "#888" }}>Loading...</p>
            ) : view === "companies" ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                    {companies.map((co) => (
                        <div
                            key={co.id}
                            onClick={() => drillDown(co.domain)}
                            style={{
                                background: "#1e1e2e",
                                borderRadius: 12,
                                padding: "1.2rem",
                                cursor: "pointer",
                                border: "1px solid #333",
                                transition: "border-color 0.2s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#6366f1")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#333")}
                        >
                            <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 4 }}>{co.name}</div>
                            <div style={{ color: "#888", fontSize: "0.85rem", marginBottom: 8 }}>🌐 {co.domain}</div>
                            <div
                                style={{
                                    display: "inline-block",
                                    padding: "2px 10px",
                                    borderRadius: 20,
                                    background: co.contact_count > 0 ? "#1e3a5f" : "#3b1e1e",
                                    color: co.contact_count > 0 ? "#60a5fa" : "#f87171",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                }}
                            >
                                {co.contact_count} contacts
                            </div>
                        </div>
                    ))}
                    {companies.length === 0 && (
                        <p style={{ color: "#666" }}>No companies discovered yet. Run a workflow to populate.</p>
                    )}
                </div>
            ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "2px solid #333", textAlign: "left" }}>
                            <th style={{ padding: 8, color: "#888" }}>Name</th>
                            <th style={{ padding: 8, color: "#888" }}>Email</th>
                            <th style={{ padding: 8, color: "#888" }}>Company</th>
                            <th style={{ padding: 8, color: "#888" }}>Source</th>
                            <th style={{ padding: 8, color: "#888" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map((c) => (
                            <tr key={c.id} style={{ borderBottom: "1px solid #222" }}>
                                <td style={{ padding: 8 }}>{c.name}</td>
                                <td style={{ padding: 8, color: "#60a5fa" }}>{c.email}</td>
                                <td style={{ padding: 8, color: "#aaa" }}>{c.company_name || "—"}</td>
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
                                <td style={{ padding: 8 }}>
                                    <button
                                        onClick={() => deleteContact(c.id)}
                                        style={{
                                            background: "#3b1e1e",
                                            color: "#f87171",
                                            border: "none",
                                            borderRadius: 6,
                                            padding: "4px 10px",
                                            cursor: "pointer",
                                            fontSize: "0.8rem",
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {contacts.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: 16, color: "#666", textAlign: "center" }}>
                                    No contacts found. Run a workflow to discover HR contacts.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </main>
    );
}
