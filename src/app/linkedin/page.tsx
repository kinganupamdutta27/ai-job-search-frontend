"use client";

import { useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface LinkedInPost {
  id: string;
  content: string;
  full_content: string;
  topic: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  error: string | null;
  created_at: string | null;
}

type Tab = "generate" | "credentials" | "posts" | "scheduled";

export default function LinkedInPage() {
  const [tab, setTab] = useState<Tab>("generate");

  // Credentials
  const [credEmail, setCredEmail] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credTotp, setCredTotp] = useState("");
  const [credStatus, setCredStatus] = useState<{ configured: boolean; last_verified: string | null } | null>(null);
  const [credLoading, setCredLoading] = useState(false);
  const [credMessage, setCredMessage] = useState("");

  // Post generation
  const [topic, setTopic] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [generatedPostId, setGeneratedPostId] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState("");
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishMessage, setPublishMessage] = useState("");

  // Scheduling
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState("");

  // Posts list
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<LinkedInPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Expanded post view
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchCredStatus();
  }, []);

  useEffect(() => {
    if (tab === "posts") fetchPosts();
    if (tab === "scheduled") fetchSchedules();
  }, [tab]);

  const fetchCredStatus = async () => {
    try {
      const res = await fetch(`${API}/api/linkedin/auth/status`);
      const data = await res.json();
      setCredStatus(data);
    } catch { /* ignore */ }
  };

  const saveCreds = async () => {
    setCredLoading(true);
    setCredMessage("");
    try {
      const res = await fetch(`${API}/api/linkedin/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: credEmail, password: credPassword, totp_secret: credTotp || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to save");
      setCredMessage("Credentials saved securely.");
      setCredEmail("");
      setCredPassword("");
      setCredTotp("");
      fetchCredStatus();
    } catch (e: any) {
      setCredMessage(`Error: ${e.message}`);
    }
    setCredLoading(false);
  };

  const verifyCreds = async () => {
    setCredLoading(true);
    setCredMessage("Verifying login (this may take a moment)...");
    try {
      const res = await fetch(`${API}/api/linkedin/auth/verify`, { method: "POST" });
      const data = await res.json();
      setCredMessage(data.success ? "Login verified successfully!" : `Verification failed: ${data.message}`);
      fetchCredStatus();
    } catch (e: any) {
      setCredMessage(`Error: ${e.message}`);
    }
    setCredLoading(false);
  };

  const generatePost = async () => {
    if (!topic.trim()) return;
    setGenLoading(true);
    setGenError("");
    setGeneratedContent("");
    setGeneratedPostId("");
    setPublishMessage("");
    try {
      const res = await fetch(`${API}/api/linkedin/post/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Generation failed");
      setGeneratedContent(data.content);
      setGeneratedPostId(data.post_id);
    } catch (e: any) {
      setGenError(e.message);
    }
    setGenLoading(false);
  };

  const publishNow = async () => {
    if (!generatedPostId) return;
    setPublishLoading(true);
    setPublishMessage("");
    try {
      const res = await fetch(`${API}/api/linkedin/post/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: generatedPostId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Publish failed");
      setPublishMessage(data.success ? "Published to LinkedIn!" : `Failed: ${data.message}`);
    } catch (e: any) {
      setPublishMessage(`Error: ${e.message}`);
    }
    setPublishLoading(false);
  };

  const schedulePost = async () => {
    if (!topic.trim() || !scheduleDate) return;
    setScheduleLoading(true);
    setScheduleMessage("");
    try {
      const res = await fetch(`${API}/api/linkedin/post/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          content: generatedContent || null,
          scheduled_at: new Date(scheduleDate).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Scheduling failed");
      setScheduleMessage(`Scheduled for ${new Date(scheduleDate).toLocaleString()}`);
    } catch (e: any) {
      setScheduleMessage(`Error: ${e.message}`);
    }
    setScheduleLoading(false);
  };

  const fetchPosts = async () => {
    setPostsLoading(true);
    try {
      const res = await fetch(`${API}/api/linkedin/posts`);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch { /* ignore */ }
    setPostsLoading(false);
  };

  const fetchSchedules = async () => {
    setPostsLoading(true);
    try {
      const res = await fetch(`${API}/api/linkedin/schedules`);
      const data = await res.json();
      setScheduledPosts(data.schedules || []);
    } catch { /* ignore */ }
    setPostsLoading(false);
  };

  const cancelSchedule = async (postId: string) => {
    try {
      await fetch(`${API}/api/linkedin/schedules/${postId}`, { method: "DELETE" });
      setScheduledPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch { /* ignore */ }
  };

  const statusColor: Record<string, string> = {
    draft: "#3b82f6",
    scheduled: "#f59e0b",
    published: "#22c55e",
    failed: "#ef4444",
    cancelled: "#6b7280",
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "generate", label: "Generate Post" },
    { id: "credentials", label: "Credentials" },
    { id: "scheduled", label: "Scheduled" },
    { id: "posts", label: "All Posts" },
  ];

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.3rem" }}>
        LinkedIn Manager
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        Generate human-like posts, publish to LinkedIn, and schedule automated posting.
      </p>

      {/* Warning Banner */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderRadius: 8,
          background: "rgba(245, 158, 11, 0.1)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          color: "#f59e0b",
          fontSize: "0.8rem",
          marginBottom: "1.5rem",
        }}
      >
        <strong>Warning:</strong> LinkedIn actively detects automation. Using this feature may risk your account.
        Use responsibly and at your own risk.
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "0.5rem 1.2rem",
              borderRadius: 8,
              border: "none",
              background: tab === t.id ? "#6366f1" : "var(--bg-card)",
              color: tab === t.id ? "#fff" : "var(--text-muted)",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.85rem",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Credentials Tab */}
      {tab === "credentials" && (
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>LinkedIn Credentials</h3>

          {credStatus && (
            <div style={{ marginBottom: "1rem", fontSize: "0.85rem" }}>
              <span style={{ color: credStatus.configured ? "#22c55e" : "#f87171" }}>
                {credStatus.configured ? "Credentials saved" : "Not configured"}
              </span>
              {credStatus.last_verified && (
                <span style={{ color: "var(--text-muted)", marginLeft: "1rem" }}>
                  Last verified: {new Date(credStatus.last_verified).toLocaleString()}
                </span>
              )}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: 400 }}>
            <input
              className="input-field"
              type="email"
              placeholder="LinkedIn email"
              value={credEmail}
              onChange={(e) => setCredEmail(e.target.value)}
            />
            <input
              className="input-field"
              type="password"
              placeholder="LinkedIn password"
              value={credPassword}
              onChange={(e) => setCredPassword(e.target.value)}
            />
            <input
              className="input-field"
              type="text"
              placeholder="TOTP secret (optional, for 2FA)"
              value={credTotp}
              onChange={(e) => setCredTotp(e.target.value)}
            />
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button className="btn-primary" onClick={saveCreds} disabled={credLoading || !credEmail || !credPassword}>
                {credLoading ? "Saving..." : "Save Credentials"}
              </button>
              {credStatus?.configured && (
                <button className="btn-secondary" onClick={verifyCreds} disabled={credLoading}>
                  {credLoading ? "Verifying..." : "Verify Login"}
                </button>
              )}
            </div>
          </div>

          {credMessage && (
            <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: credMessage.includes("Error") ? "#f87171" : "#22c55e" }}>
              {credMessage}
            </p>
          )}

          <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: 8, background: "rgba(99, 102, 241, 0.08)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            Credentials are encrypted with Fernet at rest. The encryption key is stored in your server&apos;s .env file, never in the database.
          </div>
        </div>
      )}

      {/* Generate Tab */}
      {tab === "generate" && (
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>Generate a LinkedIn Post</h3>

          <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: 4 }}>
            Topic / Prompt
          </label>
          <textarea
            className="input-field"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Recent AI trends in software development, thoughts on remote work culture"
            rows={3}
            style={{ width: "100%", resize: "vertical", marginBottom: "1rem" }}
          />

          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={generatePost} disabled={genLoading || !topic.trim()}>
              {genLoading ? "Researching & Generating..." : "Generate Post"}
            </button>
          </div>

          {genError && (
            <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#f87171" }}>{genError}</p>
          )}

          {generatedContent && (
            <div style={{ marginTop: "1.5rem" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: 6 }}>
                Generated Post (editable)
              </label>
              <textarea
                className="input-field"
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                rows={12}
                style={{ width: "100%", resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
              />

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                <button className="btn-primary" onClick={publishNow} disabled={publishLoading}>
                  {publishLoading ? "Publishing..." : "Publish Now"}
                </button>

                <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginBottom: 2 }}>
                      Schedule for
                    </label>
                    <input
                      className="input-field"
                      type="datetime-local"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      style={{ width: 220 }}
                    />
                  </div>
                  <button
                    className="btn-secondary"
                    onClick={schedulePost}
                    disabled={scheduleLoading || !scheduleDate}
                  >
                    {scheduleLoading ? "Scheduling..." : "Schedule"}
                  </button>
                </div>
              </div>

              {publishMessage && (
                <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: publishMessage.includes("Error") || publishMessage.includes("Failed") ? "#f87171" : "#22c55e" }}>
                  {publishMessage}
                </p>
              )}
              {scheduleMessage && (
                <p style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: scheduleMessage.includes("Error") ? "#f87171" : "#22c55e" }}>
                  {scheduleMessage}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Scheduled Tab */}
      {tab === "scheduled" && (
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem" }}>
            Scheduled Posts ({scheduledPosts.length})
          </h3>

          {postsLoading ? (
            <p style={{ color: "var(--text-muted)" }}>Loading...</p>
          ) : scheduledPosts.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No scheduled posts.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {scheduledPosts.map((p: any) => (
                <div
                  key={p.id}
                  style={{
                    padding: "1rem",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{p.topic || "Untitled"}</div>
                    <button
                      onClick={() => cancelSchedule(p.id)}
                      style={{
                        background: "#3b1e1e",
                        color: "#f87171",
                        border: "none",
                        borderRadius: 6,
                        padding: "4px 12px",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Scheduled: {p.scheduled_at ? new Date(p.scheduled_at).toLocaleString() : "—"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: 4 }}>
                    {p.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Posts Tab */}
      {tab === "posts" && (
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 600 }}>All Posts ({posts.length})</h3>
            <button className="btn-secondary" onClick={fetchPosts} style={{ fontSize: "0.8rem" }}>
              Refresh
            </button>
          </div>

          {postsLoading ? (
            <p style={{ color: "var(--text-muted)" }}>Loading...</p>
          ) : posts.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No posts yet. Generate one to get started.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {posts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: "1rem",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid var(--border-subtle)",
                    cursor: "pointer",
                  }}
                  onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{p.topic || "Untitled"}</div>
                    <span
                      style={{
                        padding: "2px 10px",
                        borderRadius: 12,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: `${statusColor[p.status] || "#666"}22`,
                        color: statusColor[p.status] || "#666",
                      }}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {p.created_at ? new Date(p.created_at).toLocaleString() : ""}
                    {p.published_at && ` | Published: ${new Date(p.published_at).toLocaleString()}`}
                  </div>
                  {expandedId === p.id ? (
                    <div style={{ marginTop: 8, fontSize: "0.85rem", color: "var(--text-secondary)", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                      {p.full_content}
                    </div>
                  ) : (
                    <div style={{ marginTop: 4, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {p.content}
                    </div>
                  )}
                  {p.error && (
                    <div style={{ marginTop: 4, fontSize: "0.8rem", color: "#f87171" }}>
                      Error: {p.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
