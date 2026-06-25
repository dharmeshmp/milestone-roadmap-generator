# Milestone Roadmap Generator

An interactive, high-fidelity visual roadmap and capacity planner built with **Next.js**, **TypeScript**, and **SQLite**. Designed for engineering teams to align on milestones, track developer utilization, and manage daily Jira tickets in a unified dashboard.

---

## 🚀 Key Features

- 🗺️ **Roadmap Canvas**: Interactive visual timeline of milestones with custom status pills, highlighted path connectors, and custom icons.
- 📊 **Capacity Canvas**: Real-time team capacity planner tracking developer utilization percentages computed directly from active Jira tickets and customizable threshold rules.
- 📋 **Ticket Board**: Jira-style Kanban/board view supporting tickets in `To Do`, `In Progress`, `Reassigned`, and `Done` states, complete with time logging and remarks.
- 📐 **Vector SVG Export**: Export high-fidelity vector SVGs of your Roadmap or Capacity plans directly to your local machine.
- 💾 **State Import/Export**: Backup and restore the entire application state (milestones, developers, and tickets) with complete JSON import/export utilities.
- ⚙️ **Persistent Settings**: Customize working hours per day, canvas backgrounds (light, dark, grid, slate), status styles, and threshold definitions.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (Client-side interactivity + Server Actions)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)
- **Database**: [SQLite](https://sqlite.org/) (managed via `better-sqlite3` locally in `project.db`)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 🏁 Getting Started

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## 📂 Project Structure

```
milestone-roadmap-generator/
├── src/
│   ├── app/
│   │   ├── actions/          # Next.js Server Actions for database CRUD
│   │   │   ├── developers.ts # Developer / Team member operations
│   │   │   ├── milestones.ts # Milestone timeline operations
│   │   │   ├── tickets.ts    # Jira tickets & timelogs
│   │   │   └── importExport.ts
│   │   ├── globals.css       # Tailwind and global styles
│   │   ├── layout.tsx        # HTML structure & fonts setup
│   │   └── page.tsx          # Main application page & state orchestrator
│   ├── components/           # UI Components
│   │   ├── CapacityCanvas.tsx
│   │   ├── TicketBoardCanvas.tsx
│   │   ├── RoadmapCanvas.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── DeveloperModal.tsx
│   │   └── SettingsModal.tsx
│   ├── lib/
│   │   └── db.ts             # SQLite connection initialization & seeding
│   ├── initialData.ts        # Default mockup & reference values
│   └── types.ts              # TypeScript interface definitions
├── project.db                # SQLite database (auto-created on start)
├── tailwind.config.ts        # Styling customizations
└── README.md
```

---

## ⚙️ Configuration & Customization

- **Capacity Thresholds**: By default, utilization under `75%` is color-coded green (Available), between `75%` and `90%` is orange/amber (Busy), and over `90%` is red (At Risk). These ranges can be configured in the sidebar settings.
- **Database Seeding**: On the first launch, the database automatically seeds with default developers, milestones, and Jira ticket records defined in `src/initialData.ts`. You can reset the SQLite database back to these mockup defaults at any time via the UI.
