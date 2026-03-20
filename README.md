<div align="center">



<h1>AssignFlow</h1>

<p><strong>The student productivity system built for real college life.</strong><br/>Track assignments, never miss Google Form deadlines, study smarter with Pomodoro — all in one place.</p>

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-7C3AED?style=for-the-badge&logo=vercel)](https://assignflow-flame.vercel.app/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Design System](#design-system)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Supabase Setup](#supabase-setup)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Database Schema](#database-schema)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Responsive Design](#responsive-design)
- [License](#license)

---

## Overview

AssignFlow is a focused, production-ready student productivity web application. It was built to solve three real problems that college students face every day:

1. **Forgetting assignment deadlines** — AssignFlow keeps every assignment visible, sorted by urgency, with colour-coded overdue indicators.
2. **Missing Google Form MCQ submissions** — Students paste the form link once, set a deadline, and the app tracks submission status automatically.
3. **Inconsistent study habits** — A built-in Pomodoro timer encourages focused work sessions and logs study time automatically.

AssignFlow is not a generic to-do app. Every screen, every piece of data, and every interaction is designed around the academic workflow of a college student.

---


## Features

### Assignment Manager
- Create, edit, and delete assignments with full details
- Fields: title, subject, description, due date, priority, status, file attachment
- Status tracking: **Pending → In Progress → Completed**
- Priority levels: Low, Medium, High — each colour-coded
- Filter by status and subject
- Overdue assignments highlighted in salmon red
- Attach images, PDF files, or DOCX documents to any assignment
- Sorted automatically by urgency (closest deadline first)

### MCQ Link Tracker
- Paste any Google Form or online quiz link
- Set a deadline and track submission status manually
- Statuses: **Pending → Submitted → Missed**
- "Open Form" button opens the link directly in a new tab
- Visual urgency indicators (green / amber / red) based on days remaining
- Alerts for forms due within 2 days

### Study Timer (Pomodoro)
- Two focus modes: **25 minutes** (standard Pomodoro) and **50 minutes** (deep work)
- Animated SVG circular progress ring
- Break timer with configurable durations: 5, 10, or 15 minutes
- Auto-transitions from focus session → break → focus
- Optional task linking — attach a session to an assignment or MCQ
- Session history saved automatically on completion
- Sessions counted per day and shown in Stats

### Dashboard
- Personalised greeting with name and avatar
- Today's date displayed prominently
- Alert banner for overdue or urgent items (colour-coded by severity)
- 3 summary stat tiles: Due Today, MCQ Urgent, Study Time
- Quick Action buttons: Add Assignment, Add MCQ, Start Timer, View Stats
- "Due Today" and "MCQ Due Soon" lists
- "All Clear" state with illustration when nothing is urgent
- Keyboard shortcuts panel (desktop)

### User Profile
- Set display name and gender on first login
- Avatar with initials shown in the header
- Dropdown menu with Edit Profile and Sign Out
- Profile data stored in Supabase `public.users` table

### Stats & Progress
- Assignment completion rate (%)
- MCQ submission rate (%)
- Total study time and today's study time
- Animated progress bars per metric
- Breakdown by subject
- Recent sessions list with type indicator

### Responsive Layout
- **Mobile** (< 640px): Bottom navigation bar, full-width layout
- **Tablet** (640–1023px): Bottom navigation, wider content area
- **Desktop / Laptop** (≥ 1024px): Persistent sidebar navigation, multi-column dashboard, 4-column quick actions, 2-column stats

---

## Tech Stack

| Category | Technology | Purpose |
|---|---|---|
| Frontend Framework | React 19 | UI components and state management |
| Build Tool | Vite 8 | Fast development server and production build |
| Animations | Framer Motion 12 | Page transitions, modals, card animations |
| Icons | Lucide React | Consistent, lightweight icon set |
| Backend | Supabase | PostgreSQL database, auth, storage |
| Auth | Supabase Auth | Email + password authentication |
| Storage | Supabase Storage | File uploads (images, PDF, DOCX) |
| Deployment | Vercel | CI/CD from GitHub, global CDN |
| Fonts | Google Fonts (Nunito) | Rounded, student-friendly typography |

---

## Design System

AssignFlow uses a strictly defined pastel colour palette. Every colour has a specific semantic meaning and is never used outside that meaning.

### Colour Palette

| Token | Hex | Usage |
|---|---|---|
| Lavender | `#7C3AED` | Primary accent, buttons, active states |
| Lavender Mid | `#C4B5FD` | Borders, secondary elements |
| Lavender Light | `#EDE9FE` | Backgrounds, input fields, cards |
| Mint | `#059669` | Success, completed, all clear |
| Mint Light | `#D1FAE5` | Completed state backgrounds |
| Salmon | `#DC2626` | Alerts, overdue, urgent, errors |
| Salmon Light | `#FEE2E2` | Alert backgrounds, destructive actions |
| Soft Blue | `#2563EB` | MCQ screen, secondary actions |
| Blue Light | `#DBEAFE` | MCQ backgrounds, secondary surfaces |
| Amber | `#D97706` | Medium priority, in-progress, warnings |
| Amber Light | `#FEF3C7` | Warning backgrounds |
| Background | `#F5F3FF` | App background (very light lavender tint) |
| Text Dark | `#1E1B4B` | Headings, primary text |
| Text Mid | `#6B7280` | Secondary text, labels |
| Text Light | `#9CA3AF` | Placeholder, inactive states |

### Typography

- **Font**: Nunito (Google Fonts)
- **Weights used**: 400, 500, 600, 700, 800, 900
- **Heading size**: 23–27px, weight 800
- **Body**: 13–15px, weight 600
- **Labels**: 10–12px, weight 700, uppercase, letter-spacing 0.5px

### Component Principles

- All cards: `border-radius: 14–16px`, soft lavender shadow
- All buttons: `border-radius: 10–12px`, no harsh colours
- Modals: bottom-sheet on mobile, centered dialog on desktop
- All interactions have `whileTap={{ scale: 0.95–0.98 }}` feedback
- Page transitions: 180ms fade + 16px horizontal slide

---

## Project Structure

```
assignflow/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── pages/
│   │   └── AuthScreen.jsx        # Login and sign-up screen
│   │
│   ├── services/
│   │   └── supabase.js           # Supabase client + all DB functions
│   │
│   ├── App.jsx                   # Root — auth guard, data fetching, handlers
│   ├── AssignFlow.jsx            # Main app — all screens and components
│   └── main.jsx                  # React DOM entry point
│
├── .env                          # Environment variables (never commit)
├── .gitignore
├── index.html
├── package.json
├── schema.sql                    # Supabase database schema
├── vercel.json                   # Vercel deployment config
└── vite.config.js                # Vite configuration
```

### Key Files Explained

| File | Responsibility |
|---|---|
| `AssignFlow.jsx` | Self-contained app with all 5 screens, all UI components, SVG illustrations, responsive layout logic. ~1800 lines. |
| `App.jsx` | Auth listener, data fetching on login, all CRUD handlers, passes everything as props to AssignFlow. |
| `services/supabase.js` | Single source of truth for all Supabase calls — auth, assignments, MCQ links, sessions, profile. |
| `pages/AuthScreen.jsx` | Standalone login/signup page used before session is established. |
| `schema.sql` | Full PostgreSQL schema with tables, indexes, RLS policies, and auth trigger. Run once in Supabase SQL Editor. |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (for deployment)

### Local Development

**1. Clone the repository**

```bash
git clone https://github.com/your-username/assignflow.git
cd assignflow
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

**4. Set up the database**

See the [Supabase Setup](#supabase-setup) section below.

**5. Start the development server**

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Supabase Setup

### Step 1 — Create a project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a name, set a database password, and select a region
3. Wait approximately 2 minutes for provisioning

### Step 2 — Run the schema

1. In the Supabase dashboard, go to **SQL Editor → New Query**
2. Paste the entire contents of `schema.sql`
3. Click **Run** — you should see "Success. No rows returned."

### Step 3 — Disable email confirmation (for development)

1. Go to **Authentication → Providers → Email**
2. Toggle off **Confirm email**
3. Click **Save**

### Step 4 — Create a Storage bucket

1. Go to **Storage → New Bucket**
2. Name: `assignment-files`
3. Enable **Public bucket**
4. Click **Create**

Then run these policies in **SQL Editor**:

```sql
create policy "allow uploads" on storage.objects
  for insert with check (bucket_id = 'assignment-files');

create policy "allow reads" on storage.objects
  for select using (bucket_id = 'assignment-files');
```

### Step 5 — Grant table permissions

Run this in **SQL Editor** if you encounter permission errors:

```sql
grant all on public.assignments to authenticated;
grant all on public.mcq_links to authenticated;
grant all on public.study_sessions to authenticated;
grant all on public.users to authenticated;
```

### Step 6 — Fix foreign key constraints (if needed)

If you get "permission denied for table" errors:

```sql
alter table public.assignments drop constraint if exists assignments_user_id_fkey;
alter table public.assignments
  add constraint assignments_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.mcq_links drop constraint if exists mcq_links_user_id_fkey;
alter table public.mcq_links
  add constraint mcq_links_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

alter table public.study_sessions drop constraint if exists study_sessions_user_id_fkey;
alter table public.study_sessions
  add constraint study_sessions_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;
```

---

## Environment Variables

| Variable | Description | Where to find it |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your public anon key | Supabase → Settings → API → anon public |

> **Important**: Never commit your `.env` file. It is listed in `.gitignore` by default. For Vercel deployment, add these variables in **Vercel → Settings → Environment Variables**.

---

## Deployment

### Deploy to Vercel

**Option 1 — Vercel CLI**

```bash
npm install -g vercel
vercel
```

Follow the prompts. When asked for the build command, use `vite build`.

**Option 2 — GitHub Integration (recommended)**

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repository
4. Set **Root Directory** to your project folder if nested
5. Set **Install Command** to `npm install --include=dev`
6. Add your environment variables
7. Click **Deploy**

### Vercel Configuration

The `vercel.json` in the project root handles the build configuration:

```json
{
  "buildCommand": "npm install --include=dev && npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

## Database Schema

### Tables

#### `public.users`
Mirrors Supabase auth users. Created automatically on sign-up via a database trigger.

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key, references `auth.users` |
| `email` | text | User email |
| `display_name` | text | User's chosen display name |
| `gender` | text | male / female / other |
| `created_at` | timestamptz | Row creation timestamp |

#### `public.assignments`

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | References `auth.users` |
| `title` | text | Assignment title |
| `subject` | text | Subject name |
| `description` | text | Full description |
| `due_date` | date | Deadline |
| `priority` | text | low / medium / high |
| `status` | text | pending / in_progress / completed |
| `image_url` | text | JSON string: `{ url, name, mime }` |
| `created_at` | timestamptz | Row creation timestamp |

#### `public.mcq_links`

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | References `auth.users` |
| `title` | text | Quiz or form name |
| `link` | text | Full URL to the form |
| `subject` | text | Subject name |
| `deadline` | date | Submission deadline |
| `status` | text | pending / submitted / missed |
| `created_at` | timestamptz | Row creation timestamp |

#### `public.study_sessions`

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `user_id` | uuid | References `auth.users` |
| `related_title` | text | Name of linked task |
| `type` | text | assignment / mcq / null |
| `duration` | integer | Session length in minutes |
| `created_at` | timestamptz | Session completion timestamp |

### Row Level Security

All tables have RLS enabled. Users can only read and write their own rows. Policies use `auth.uid()` directly without depending on `public.users`.

---

## Keyboard Shortcuts

Available on desktop (≥ 1024px wide). Ignored when typing in input fields.

| Key | Action |
|---|---|
| `1` | Navigate to Dashboard |
| `2` | Navigate to Assignments |
| `3` | Navigate to MCQ Links |
| `4` | Navigate to Study Timer |
| `5` | Navigate to Stats |

---

## Responsive Design

AssignFlow adapts to every screen size with a dedicated layout per breakpoint.

| Breakpoint | Width | Navigation | Layout |
|---|---|---|---|
| Mobile | < 640px | Bottom tab bar | Single column, 16px padding |
| Tablet | 640–1023px | Bottom tab bar | 600px max width, 16px padding |
| Laptop | 1024–1439px | Sidebar (220px) | 780px content, 32px padding |
| Desktop / Mac | ≥ 1440px | Sidebar (220px) | 780px content, multi-column grids |

### Desktop-specific features
- Persistent sidebar with logo, navigation, profile, and sign out
- Dashboard splits into 2 columns (tasks left, MCQ right)
- Quick Actions show in a 4-column grid
- Stat tiles show in a single row of 4
- Stats breakdowns show in a 2-column grid
- Profile modal is a centered dialog instead of a bottom sheet
- Keyboard shortcuts enabled

---

## Common Issues & Fixes

| Error | Cause | Fix |
|---|---|---|
| `vite: command not found` | Vercel skips devDependencies | Set install command to `npm install --include=dev` |
| `permission denied for table` | Supabase RLS or missing grants | Run the grant statements in SQL Editor |
| `Missing VITE_SUPABASE_URL` | `.env` not set | Add env vars in Vercel settings |
| Assignment not saving | Wrong function signature | Update to latest `AssignFlow.jsx` |
| Login redirects back | Email not confirmed | Disable email confirmation in Supabase Auth settings |
| Image upload fails | Storage bucket missing | Create `assignment-files` bucket in Supabase Storage |

---


## Contributing

Contributions are welcome. Please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT License — free to use, modify, and distribute.

---

<div align="center">

Built with focus, for students who have too much to track and too little time.
### BY PAVITHRA H

</div>
