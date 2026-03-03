"use client";

import { useState, useRef } from "react";
import { uploadCV, startWorkflow } from "@/lib/api";

export default function CVUploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState<any>(null);
    const [workflowResult, setWorkflowResult] = useState<any>(null);
    const [location, setLocation] = useState("India");
    const [maxJobs, setMaxJobs] = useState(20);
    const [error, setError] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError("");
        try {
            const result = await uploadCV(file);
            setUploadResult(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleStartWorkflow = async () => {
        if (!uploadResult?.file_path) return;
        setUploading(true);
        setError("");
        try {
            const result = await startWorkflow({
                cv_file_path: uploadResult.file_path,
                search_location: location,
                max_jobs: maxJobs,
            });
            setWorkflowResult(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fade-in">
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px" }}>
                Upload Your CV
            </h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
                Upload your resume and let AI analyze it, find jobs, and generate
                outreach emails.
            </p>

            {error && (
                <div
                    className="glass-card"
                    style={{
                        padding: "12px 16px",
                        marginBottom: "20px",
                        borderColor: "rgba(239, 68, 68, 0.3)",
                        color: "var(--danger)",
                    }}
                >
                    ⚠️ {error}
                </div>
            )}

            {/* Upload Zone */}
            {!uploadResult && (
                <div
                    className={`upload-zone ${dragOver ? "dragover" : ""}`}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const f = e.dataTransfer.files[0];
                        if (f) setFile(f);
                    }}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".pdf,.docx,.txt"
                        style={{ display: "none" }}
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setFile(f);
                        }}
                    />
                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
                    {file ? (
                        <>
                            <p style={{ fontWeight: 600, fontSize: "16px" }}>{file.name}</p>
                            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                                {(file.size / 1024).toFixed(1)} KB
                            </p>
                            <button
                                className="btn-primary"
                                style={{ marginTop: "16px" }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpload();
                                }}
                                disabled={uploading}
                            >
                                {uploading ? (
                                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span className="spinner" /> Uploading...
                                    </span>
                                ) : (
                                    "Upload & Parse CV"
                                )}
                            </button>
                        </>
                    ) : (
                        <>
                            <p style={{ fontWeight: 600, fontSize: "16px" }}>
                                Drag & drop your CV here
                            </p>
                            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                                Supports PDF, DOCX, and TXT files
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* Upload Result + Workflow Start */}
            {uploadResult && !workflowResult && (
                <div className="glass-card" style={{ padding: "24px", marginTop: "20px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
                        ✅ CV Uploaded Successfully
                    </h2>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                            marginBottom: "20px",
                        }}
                    >
                        <div>
                            <label style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                                Filename
                            </label>
                            <p>{uploadResult.filename}</p>
                        </div>
                        <div>
                            <label style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                                Text Length
                            </label>
                            <p>{uploadResult.text_length} characters</p>
                        </div>
                    </div>

                    <div
                        className="glass-card"
                        style={{
                            padding: "16px",
                            marginBottom: "20px",
                            maxHeight: "200px",
                            overflow: "auto",
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {uploadResult.text_preview}
                    </div>

                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "12px",
                            marginBottom: "20px",
                        }}
                    >
                        <div>
                            <label
                                style={{
                                    color: "var(--text-secondary)",
                                    fontSize: "13px",
                                    marginBottom: "6px",
                                    display: "block",
                                }}
                            >
                                Search Location
                            </label>
                            <input
                                className="input-field"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="e.g., India, Bangalore, Remote"
                            />
                        </div>
                        <div>
                            <label
                                style={{
                                    color: "var(--text-secondary)",
                                    fontSize: "13px",
                                    marginBottom: "6px",
                                    display: "block",
                                }}
                            >
                                Max Jobs to Search
                            </label>
                            <input
                                className="input-field"
                                type="number"
                                value={maxJobs}
                                onChange={(e) => setMaxJobs(parseInt(e.target.value) || 20)}
                                min={5}
                                max={50}
                            />
                        </div>
                    </div>

                    <button
                        className="btn-primary"
                        onClick={handleStartWorkflow}
                        disabled={uploading}
                        style={{ width: "100%" }}
                    >
                        {uploading ? (
                            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                <span className="spinner" /> Starting AI Workflow...
                            </span>
                        ) : (
                            "🚀 Start AI Job Search Workflow"
                        )}
                    </button>
                </div>
            )}

            {/* Workflow Started */}
            {workflowResult && (
                <div className="glass-card" style={{ padding: "24px", marginTop: "20px" }}>
                    <h2 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
                        🚀 Workflow Started
                    </h2>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: "16px",
                            marginBottom: "20px",
                        }}
                    >
                        <div className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
                            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--info)" }}>
                                {workflowResult.jobs_found}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Jobs Found</div>
                        </div>
                        <div className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
                            <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--accent-primary)" }}>
                                {workflowResult.emails_generated}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Emails Generated</div>
                        </div>
                        <div className="glass-card" style={{ padding: "16px", textAlign: "center" }}>
                            <div style={{ fontSize: "14px", fontWeight: 600 }}>
                                <span className={`badge ${workflowResult.status === "awaiting_review" ? "badge-warning" : workflowResult.status === "failed" ? "badge-danger" : "badge-info"}`}>
                                    {workflowResult.status.replace(/_/g, " ")}
                                </span>
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>Status</div>
                        </div>
                    </div>

                    {workflowResult.errors?.length > 0 && (
                        <div style={{ marginBottom: "16px" }}>
                            {workflowResult.errors.map((err: string, i: number) => (
                                <div key={i} style={{ color: "var(--danger)", fontSize: "13px" }}>
                                    ⚠️ {err}
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ display: "flex", gap: "12px" }}>
                        <a href={`/jobs/${workflowResult.run_id}`}>
                            <button className="btn-secondary">📋 View Jobs</button>
                        </a>
                        {workflowResult.status === "awaiting_review" && (
                            <a href={`/emails/${workflowResult.run_id}`}>
                                <button className="btn-primary">✉️ Review & Send Emails</button>
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
