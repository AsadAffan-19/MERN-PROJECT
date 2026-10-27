# Wage Tracker — Daily Wage Worker Attendance & Pay

A MERN app for a contractor to track daily attendance of workers and calculate their pay
(minus any advances paid). No login. It is meant for a single contractor, whose details are
stored in one profile document.

- **client/**: React (Vite) frontend
- **server/**: Node.js + Express API, MongoDB via Mongoose

## Setup

You need Node.js 18+ and a MongoDB Atlas connection string.

### 1. Server

```bash
cd server
npm install
cp .env.example .env   # then put your MONGO_URI in .env
npm run dev            # or: npm start
```

`server/.env`:

```
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/wagetracker?retryWrites=true&w=majority
PORT=5001
```

The API runs at http://localhost:5001/api.
(Port 5001 is used because macOS AirPlay Receiver already uses port 5000.)

### 2. Client (in a second terminal)

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173.

If the server runs on a different URL, create `client/.env` with
`VITE_API_URL=http://localhost:<port>/api`.

## Pages

The left sidebar shows the company and links to Workers, Attendance and Wages. The top bar has:
- a **search box** (⌘K / Ctrl+K) that filters the worker lists on every page
- a **bell** that lists workers whose attendance hasn't been marked today
- the **admin profile** menu

1. **Workers** (`/`): today's summary cards, then a list of workers with today's status and this month's earnings.
   Supports filter (by today's status), sort, add/edit (pop-up) and delete.
2. **Attendance** (`/attendance?month=YYYY-MM`): a spreadsheet with one row per worker and one column per day.
   Click any cell to set Present / Absent / Half Day / Leave. Today's column is highlighted.
   Click a worker's name to see their wages.
3. **Wages** (`/wages`): cumulative wages for every worker for a chosen day, week or month,
   with a totals row, trends against the previous period, a filter and CSV export.
   Click a worker to open their own wage page.
4. **Worker Wages** (`/wages/:workerId`): Day / Week / Month toggle with a date picker, a pay summary,
   a day-by-day breakdown, and a form to add an advance.
5. **Profile** (`/profile`, opened from the top right): the admin's name, company details and bank details.

## API

| Method | Route | Purpose |
|---|---|---|
| GET | /api/workers | List workers |
| POST | /api/workers | Add worker `{ name, dailyWage, phone }` |
| PUT | /api/workers/:id | Edit worker |
| DELETE | /api/workers/:id | Delete worker (also deletes their attendance and advances) |
| GET | /api/attendance?month=YYYY-MM | All attendance for a month, with worker names |
| POST | /api/attendance | Create or update `{ workerId, date, status }` |
| GET | /api/advances/:workerId | A worker's advances |
| POST | /api/advances | Add advance `{ workerId, amount, date, note }` |
| GET | /api/wages?period=day\|week\|month&date=YYYY-MM-DD | Cumulative wages for all workers, with totals |
| GET | /api/wages/:workerId?period=day\|week\|month&date=YYYY-MM-DD | Wage calculation for one worker |
| GET | /api/profile | Admin profile (created empty on first request) |
| PUT | /api/profile | Update admin profile |

### How wages are calculated (`server/routes/wages.js`)

1. **Range:** `day` is that single date. `week` is Monday to Sunday of the week containing that date.
   `month` is the whole calendar month.
2. **Days worked:** Present = 1, Half Day = 0.5, Absent / Leave / not marked = 0.
3. **Gross pay** = days worked × daily wage.
4. **Total advances** = sum of the worker's advances dated inside the range.
5. **Balance** = gross pay − total advances.

Dates are stored as midnight UTC (date only), so a date like `2026-10-27` always means the same day.
