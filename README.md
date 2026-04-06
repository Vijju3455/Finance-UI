# Finance Dashboard

## Overview
A modern, responsive financial dashboard built with Angular 21, Tailwind CSS, and Chart.js. Features global category filtering across dashboard and insights pages, theme toggle, role-based UI, and full CRUD operations for transactions.

## Features
- Dashboard overview with summary cards, balance trends, and interactive spending pie chart
- Transactions management (CRUD, search, filter, sort)
- Insights with clickable charts and category table
- Global category filter syncs across all pages
- Light/Dark theme toggle with localStorage persistence
- Admin/Viewer role-based interface
- Fully responsive design (mobile, tablet, desktop)
- Angular Signals for reactive state management
- Smooth Chart.js animations

## Quick Start
```bash
cd finance-dashboard
npm install
ng serve
```
Open [http://localhost:4200](http://localhost:4200)

## Tech Stack
- Angular 21 (standalone components, Signals)
- Tailwind CSS (JIT, dark mode)
- Chart.js
- TypeScript

## Project Structure
```
src/
├── app/
│   ├── components/     # Reusable UI (header, sidebar)
│   ├── services/       # StateService (Signals)
│   ├── dashboard-overview/
│   ├── transactions/
│   └── insights/
├── styles.css          # Global styles
└── main.ts
```

## Deployment
1. Build: `ng build --prod`
2. Deploy `dist/` folder to any static host (Netlify, Vercel, GitHub Pages)

## License
MIT
