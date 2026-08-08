# Growl SaaS — Agency OS

An AI-powered operating system for modern marketing agencies. Manage clients, projects, campaigns, finances, and AI workflows in one unified platform.

## Features
- **Authentication & Security:** JWT httpOnly cookie session control, multi-role RBAC & system policy permissions.
- **Dynamic C-Panel Theme Control:** Instant Light Mode, Dark Mode, and System Theme switching with custom Accent Color Palettes (Green, Purple, Blue, Rose, Gold, Teal).
- **Core SaaS Modules:** CRM, Clients, Projects, Campaigns, Approvals, File Management, Finance, AI Workflows, Team Management, and Meetings.
- **Enterprise Database Architecture:** Built on Next.js 16, React 19, Prisma ORM, and Tailwind CSS.

## Getting Started

First, install dependencies:
```bash
npm install
```

Set up the database:
```bash
npx prisma db push
node scripts/clean_user_seed.js
```

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
