# <center>InFlow</center>

> **Work when you're wired.**

InFlow is a weekly planning and energy alignment tool that helps you schedule time blocks around your natural energy levels. Plan recurring weekly tasks, rate your daily energy (1-5), and get insights into where your schedule doesn't match your capacity.

## Table of Contents

1. [Key Features](#key-features)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Contributing](#contributing)

---

## Key Features

- **Weekly Planning**: Create recurring time blocks (deep work, meetings, admin, etc.) that repeat every week with a single setup
- **Energy Alignment**: Rate your energy level (1-5) each evening to track how well your schedule matches your capacity
- **Visual Calendar**: Intuitive weekly grid with color-coded block types, overlapping event handling, and drag-friendly interactions
- **Clerk Authentication**: Secure, passwordless auth with Clerk integrated directly into TanStack Start
- **Supabase Backend**: PostgreSQL database with Row Level Security (RLS) to keep user data isolated

---

## Tech Stack

| Category            | Technology                                                               |
| ------------------- | ------------------------------------------------------------------------ |
| **Framework**       | [TanStack Start](https://tanstack.com/start) (full-stack React with SSR) |
| **Language**        | TypeScript 5.7+                                                          |
| **Frontend**        | React 19, TanStack Router (file-based), TanStack Query, TanStack Store   |
| **Styling**         | Tailwind CSS v4, shadcn/ui (radix-maia preset), HugeIcons, Framer Motion |
| **Authentication**  | Clerk (@clerk/tanstack-react-start)                                      |
| **Database**        | Supabase (PostgreSQL) with Row Level Security                            |
| **Package Manager** | pnpm                                                                     |
| **Testing**         | Vitest, @testing-library/react, Playwright (e2e)                         |
| **Dev Tools**       | Storybook, TanStack DevTools, ESLint, Prettier                           |
| **Build Tool**      | Vite 8                                                                   |

---

## Prerequisites

Ensure you have the following installed before setting up the project:

- **Node.js** 20 or higher ([download](https://nodejs.org/))
- **pnpm** (recommended) or npm:

  ```bash
  # Install pnpm globally
  npm install -g pnpm
  ```

- **Clerk Account**: Sign up at [clerk.com](https://clerk.com) to get API keys
- **Supabase Project**: Create a project at [supabase.com](https://supabase.com) for the database

---

## Getting Started

Follow these steps to set up the project locally from scratch:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/in-flow.git
cd in-flow
```

### 2. Install Dependencies

This project uses pnpm as the package manager:

```bash
pnpm install
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your credentials (see [Environment Variables](#environment-variables) for details):

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_SIGN_UP_URL=/sign-up

# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the migration files in order:
   - `supabase/migrations/001_initial_schema.sql` (creates tables and RLS policies)
   - `supabase/migrations/002_seed_default_block_types.sql` (creates helper function for default block types)
4. (Optional) Enable the `uuid-ossp` extension if not already enabled:

   ```sql
   create extension if not exists "uuid-ossp";
   ```

### 5. Start Development Server

```bash
pnpm dev
```

This starts the Vite dev server on [http://localhost:3000](http://localhost:3000) with:

- Hot Module Replacement (HMR) for instant UI updates
- TanStack Start server functions running locally
- Clerk authentication working in development mode

### 6. Verify Setup

1. Open [http://localhost:3000](http://localhost:3000) in your browser
2. Click "Start Planning" to go to the dashboard
3. Sign in with Clerk (test mode allows fake email sign-in)
4. You should see the calendar UI with default block types (Deep Work, Meetings, Admin, Exercise, Breaks)

---

## Environment Variables

### Required

| Variable                     | Description                         | How to Get                                  |
| ---------------------------- | ----------------------------------- | ------------------------------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key               | Clerk Dashboard → API Keys                  |
| `CLERK_SECRET_KEY`           | Clerk secret key (server-side only) | Clerk Dashboard → API Keys                  |
| `VITE_SUPABASE_URL`          | Supabase project URL                | Supabase Dashboard → Project Settings → API |
| `VITE_SUPABASE_KEY`          | Supabase anon/public key            | Supabase Dashboard → Project Settings → API |

### Clerk-Specific

| Variable                 | Description          | Default    |
| ------------------------ | -------------------- | ---------- |
| `VITE_CLERK_SIGN_IN_URL` | URL for sign-in page | `/sign-in` |
| `VITE_CLERK_SIGN_UP_URL` | URL for sign-up page | `/sign-up` |

---

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository** to your GitHub account
2. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and commit using conventional commits:

   ```bash
   git commit -m "feat: add monthly calendar view"
   ```

4. **Run checks** before pushing:

   ```bash
   pnpm check  # Format and lint
   pnpm test   # Run tests
   pnpm build  # Verify production build
   ```

5. **Push to your fork** and open a Pull Request
6. Use the PR template to describe your changes

### Issue Reporting

Use the provided GitHub issue templates:

- **Bug Report**: For reporting bugs
- **Feature Request**: For suggesting new features
- **Documentation**: For improving docs
