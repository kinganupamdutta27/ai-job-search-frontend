# AI Job Search & Email Outreach Automation (Frontend)

The frontend web application for the AI-powered job search and email outreach automation platform. This dashboard allows users to dynamically interact with the FastAPI backend, manage their resumes, execute search workflows, and track email campaigns.

## 🚀 Key Features

- **Interactive Dashboard**: Control panel for full AI automation tasks.
- **CV Management module (`/cv`)**: Upload and visualize parsed structured data from resumes.
- **Job Search module (`/jobs`)**: Configure job search parameters and monitor the AI's real-time job scraping progress.
- **Email Outreach module (`/emails` & `/templates`)**: Manage personalized outreach templates and review drafted emails before sending.
- **Settings panel (`/settings`)**: Configure global settings, system prompts, and API keys.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript

## ⚙️ Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kinganupamdutta27/ai-job-search-frontend.git
   cd ai-job-search-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or yarn / pnpm / bun install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the dashboard. Ensure the FastAPI backend is running on `http://localhost:8000` (or as configured) to handle API requests.

## 📦 Project Structure

```text
src/
├── app/          # Next.js App Router pages
│   ├── cv/       # CV upload and parsing visualization
│   ├── emails/   # Email campaign monitoring
│   ├── jobs/     # Job search execution and results
│   ├── settings/ # Configuration management
│   └── templates/# Email template configuration
└── lib/          # Utilities and API clients bridging with FastAPI
```

## 📄 License

This project is proprietary and intended for personal/internal use.
