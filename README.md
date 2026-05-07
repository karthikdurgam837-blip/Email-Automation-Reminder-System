# NexusMail: Advanced Email Automation & Reminder System

NexusMail is an industry-grade automation platform built with Node.js, Express, and React. It features a high-precision scheduling engine, professional template rendering, and a real-time activity dashboard.

## 🚀 Key Features
- **Core Engine**: Asynchronous Node.js worker that handles complex scheduling and recurrence.
- **Precision Scheduling**: Support for one-off and recurring (Cron-based) reminders.
- **Dynamic Templating**: Personalized email generation using data injection (e.g., `{name}`).
- **Professional Dashboard**: A technical "Mission Control" UI for managing nodes, campaigns, and blueprints.
- **Persistence**: SQLite-backed state management for auditable logs and reliable delivery tracking.
- **Dry-Run Mode**: Safely simulate automation without sending real emails (toggleable via SMTP secrets).

## 🛠️ Tech Stack
- **Backend**: Node.js, Express, SQLite3, Nodemailer, Croner
- **Frontend**: React 19, Tailwind CSS, Framer Motion, Lucide Icons
- **State**: SQLite (Backend), React Hooks (Frontend)

## 📁 System Architecture
```text
nexusmail-automation/
├── nexusmail.db          # SQLite Database (Auto-generated)
├── server.ts             # Express API + Vite Middleware
├── src/
│   ├── lib/
│   │   ├── db.ts         # Async SQLite Wrappers
│   │   ├── engine.ts     # NexusEngine: The Scheduler & Mailer
│   │   └── types.ts      # Type Definitions
│   └── App.tsx           # React Dashboard UI
├── .env.example          # Security Documentation
└── README.md             # Project Documentation
```

## 🏗️ Setup & Installation
1. **Clone & Install**:
   ```bash
   npm install
   ```
2. **Environment**:
   Duplicate `.env.example` to `.env`. For real email sending, provide `SMTP_USER` and `SMTP_PASS` (e.g., Gmail App Password).
3. **Run for Development**:
   ```bash
   npm run dev
   ```

## 🧪 Simulation Guide (Dry-Run)
By default, if no SMTP secrets are provided, the system runs in **Dry-Run Mode**. You can:
1. Create a **Contact** in the Contacts tab.
2. Draft a **Template** (Blueprint) with placeholders like `{name}`.
3. Initiate a **Campaign** using that blueprint.
4. Schedule a **Reminder** for the contact.
5. In 10-15 seconds, check the **Activity Logs** to see the simulated dispatch with the rendered body.

---

## 💼 Industry Relevance
This project mirrors features found in:
- **SaaS Drip Campaigns**: Onboarding sequences for new users.
- **FinTech**: Automated payment and invoice reminders.
- **EdTech**: Class reminders and assignment nudges (what this student project is modeled after).
- **Service Operations**: Internal status reports and system monitoring alerts.

## 🎤 Interview Preparation
**Q: Explain your project.**
**A:** "I built NexusMail, a full-stack automation system that schedules and dispatches personalized emails. It uses a custom-built processing engine in Node.js that checks for due events every 10 seconds, expands recurring schedules, and tracks every send with detailed status logs. I focused on making the architecture modular to support high auditability and reliable execution."

**Q: How do you handle concurrency in scheduling?**
**A:** "The `NexusEngine` uses an atomic lock pattern (`isRunning`) to ensure that multiple dispatcher cycles don't overlap, preventing duplicate emails. It queries the SQLite database for messages with a 'scheduled' status and processes them asynchronously."

**Q: How is security managed?**
**A:** "I implemented a strict separation of secrets. API keys and SMTP credentials are never hardcoded; they are injected via environment variables. On the frontend, I used schema-based definitions to ensure data integrity before commits to the database nodes."

---

*This project is built for professional portfolios as proof-of-work for Backend & Automation Engineering roles.*
