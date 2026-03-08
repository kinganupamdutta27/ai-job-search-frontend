import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Job Search Automation",
  description:
    "AI-powered job search, HR contact extraction, and personalized email outreach automation platform.",
};

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/cv", label: "CV Upload", icon: "📄" },
  { href: "/contact-finder", label: "Contact Finder", icon: "🔍" },
  { href: "/linkedin", label: "LinkedIn", icon: "💼" },
  { href: "/templates", label: "Email Templates", icon: "✉️" },
  { href: "/contacts", label: "HR Contacts", icon: "📇" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        {/* Sidebar */}
        <aside className="sidebar">
          <div style={{ marginBottom: "32px" }}>
            <h1
              style={{
                fontSize: "18px",
                fontWeight: 800,
                background: "linear-gradient(135deg, #6366f1, #a855f7)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                margin: 0,
              }}
            >
              🚀 JobSearch AI
            </h1>
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                marginTop: "4px",
              }}
            >
              Powered by LangGraph + MCP
            </p>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="sidebar-link">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div
            style={{
              position: "absolute",
              bottom: "24px",
              left: "16px",
              right: "16px",
            }}
          >
            <div
              className="glass-card"
              style={{ padding: "12px 16px", fontSize: "11px" }}
            >
              <div
                style={{
                  color: "var(--text-muted)",
                  marginBottom: "4px",
                }}
              >
                Tech Stack
              </div>
              <div style={{ color: "var(--text-secondary)" }}>
                LangGraph • MCP • OpenAI • FastAPI
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}
