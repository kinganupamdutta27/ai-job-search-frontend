/**
 * API client for communicating with the FastAPI backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  return res.json();
}

// ── CV APIs ──

export async function uploadCV(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/cv/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || "Upload failed");
  }

  return res.json();
}

export async function getCVText(fileId: string) {
  return apiRequest<any>(`/api/cv/${fileId}/text`);
}

// ── Workflow APIs ──

export async function startWorkflow(data: {
  cv_file_path: string;
  search_location?: string;
  max_jobs?: number;
  base_template?: string;
}) {
  return apiRequest<any>("/api/workflow/start", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getWorkflowStatus(runId: string) {
  return apiRequest<any>(`/api/workflow/${runId}/status`);
}

export async function submitReview(
  runId: string,
  decisions: { email_id: string; approved: boolean }[]
) {
  return apiRequest<any>(`/api/workflow/${runId}/review`, {
    method: "POST",
    body: JSON.stringify({ decisions }),
  });
}

export async function listRuns() {
  return apiRequest<any>("/api/workflow/runs");
}

// ── Email Template APIs ──

export async function getTemplates() {
  return apiRequest<any>("/api/email/templates");
}

export async function getTemplate(templateId: string) {
  return apiRequest<any>(`/api/email/templates/${templateId}`);
}

export async function updateTemplate(templateId: string, htmlContent: string) {
  return apiRequest<any>(`/api/email/templates/${templateId}`, {
    method: "PUT",
    body: JSON.stringify({ html_content: htmlContent }),
  });
}

// ── Settings APIs ──

export async function getSettings() {
  return apiRequest<any>("/api/settings");
}

export async function saveSettings(settings: Record<string, any>) {
  return apiRequest<any>("/api/settings", {
    method: "POST",
    body: JSON.stringify(settings),
  });
}

export async function getSmtpGuide() {
  return apiRequest<any>("/api/settings/smtp-guide");
}

// ── Health ──

export async function healthCheck() {
  return apiRequest<any>("/health");
}
