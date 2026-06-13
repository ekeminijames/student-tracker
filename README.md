# The Enlightenment Mentorship Institute

A student tracking web app built with React + Vite + TailwindCSS.

## Features
- **Attendance Tracker** – Add students, mark present/absent per date, view history and percentage
- **Tests & Exams** – Add tests, enter scores, auto-grade (A–F), view class stats
- **Assignments** – Track submission status (submitted / late / missing) with scores
- **Dashboard** – At-a-glance overview, highlights students at risk

## Setup

You need [Node.js](https://nodejs.org) (v18 or later).

```bash
cd student-tracker
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

## Grading Scale
| Grade | Percentage |
|-------|-----------|
| A     | 90 – 100% |
| B     | 75 – 89%  |
| C     | 60 – 74%  |
| D     | 50 – 59%  |
| F     | below 50% |

## At-Risk Criteria
A student is flagged **At Risk** on the Dashboard when:
- Attendance is below **75%**, OR
- Average test/exam mark is below **50%**

## Data Storage
All data is saved to **localStorage** in your browser — no server needed.
