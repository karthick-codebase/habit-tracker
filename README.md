# HabitFlow

HabitFlow is a full-stack habit tracking application built to help people build consistent routines, improve daily accountability, and visualize their progress over time. The app combines a React + Vite frontend with an Express + Sequelize backend and PostgreSQL storage, and supports a timezone-aware experience for users who track habits in different local schedules.

## Overview

HabitFlow is designed for people who want a simple yet thoughtful habit system. Users can:

- create and manage habits
- check in daily to mark progress
- view streaks and momentum on the dashboard
- review analytics and daily trends
- personalize their timezone and profile settings
- track progress with a clean, modern interface

The application is structured as a monorepo with a separate frontend and backend, making it easy to develop, test, and deploy independently while still working as a single product.

---

## Features

### User authentication

- user registration
- secure login with JWT authentication
- protected routes for logged-in users
- personal profile data attached to each account

### Habit management

- create new habits
- edit existing habits
- delete habits safely
- track habit descriptions and creation dates

### Daily check-ins

- mark a habit as completed for the current day
- prevent duplicate daily completion
- view history of check-ins over time
- maintain streak metrics based on user activity

### Dashboard

- summary cards for total habits, completions, and streaks
- daily progress overview
- current completion percentage
- personalized greeting with the user name

### Analytics

- overview stats
- total habits and check-ins
- today's completion rate
- longest streaks
- 30-day trend analysis
- per-habit performance tracking

### Profile and settings

- update full name
- update email address
- update timezone
- change password
- delete account

### Timezone handling

- supports IANA timezone values such as Asia/Kolkata
- timezone-aware dashboard logic
- user-specific local date calculations for habit check-ins

---

## Tech stack

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- Framer Motion
- React Hot Toast
- Lucide and React Icons
- Axios
- Luxon

### Backend

- Node.js
- Express
- Sequelize ORM
- PostgreSQL
- JWT authentication
- bcrypt password hashing
- Zod validation

### Database

- PostgreSQL via Neon or any compatible PostgreSQL host

---

## Project structure

```text
habit-tracker/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── database-cli.js
│   ├── controllers/
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── checkInController.js
│   │   ├── habitController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── migrations/
│   │   ├── 20260823153930-create-users.js
│   │   ├── 20260823154814-create-habits.js
│   │   ├── 20260824152913-create-check-ins.js
│   │   └── 20260829120000-add-name-to-users.js
│   ├── models/
│   │   ├── CheckIn.js
│   │   ├── Habit.js
│   │   ├── User.js
│   │   └── index.js
│   ├── routes/
│   │   ├── analyticsRoutes.js
│   │   ├── authRoutes.js
│   │   ├── checkInRoutes.js
│   │   ├── habitRoutes.js
│   │   └── userRoutes.js
│   ├── seeders/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── README.md
├── package.json
├── .gitignore
└── README.md
```

---

## Prerequisites

Before you begin, make sure you have:

- Node.js 18+ recommended
- npm installed
- PostgreSQL database access
- a Neon database or local PostgreSQL instance
- a JWT secret for backend authentication

---

## Environment setup

### Root project

The root project contains scripts to install dependencies and build the frontend from the project root.

### Backend environment

Create a file named .env inside the backend folder with the following values:

```env
PORT=5000
DATABASE_URL=postgresql://your_user:your_password@your_host:5432/your_database?sslmode=require
JWT_SECRET=your_super_secret_key
```

Example for Neon:

```env
PORT=5000
DATABASE_URL=postgresql://user:password@host.region.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=change_this_to_a_secure_secret
```

The backend also includes a sample file at [backend/.env.example](backend/.env.example).

### Frontend environment

Create a .env file inside the frontend folder:

```env
VITE_API_URL=http://localhost:5000/api
```

The frontend example file is [frontend/.env.example](frontend/.env.example).

---

## Installation

### 1) Install dependencies at the root

```bash
npm install
```

This will install the project root scripts only; the backend and frontend apps still need their own dependencies installed as well.

### 2) Install backend dependencies

```bash
cd backend
npm install
```

### 3) Install frontend dependencies

```bash
cd ../frontend
npm install
```

---

## Running the project

### Start backend

From the backend folder:

```bash
npm run dev
```

This starts the Express API on the port defined in the .env file, defaulting to 5000.

### Start frontend

From the frontend folder:

```bash
npm run dev
```

This starts Vite in development mode and serves the frontend locally.

### Run the app together

In separate terminals:

```bash
cd backend
npm run dev
```

and

```bash
cd frontend
npm run dev
```

Then open the frontend URL that Vite prints in the terminal, usually:

```text
http://localhost:5173
```

---

## Database setup and migrations

This project uses Sequelize migrations to manage database schema changes.

### Create the database tables

From the backend folder:

```bash
npx sequelize-cli db:migrate
```

### If using production or Neon

```bash
npx sequelize-cli db:migrate --env production
```

### Important schema note

The project recently added a `name` field to the users table. If your database was created before this migration, you must apply the new migration or add the column manually.

Migration added for this fix:

- [backend/migrations/20260829120000-add-name-to-users.js](backend/migrations/20260829120000-add-name-to-users.js)

If the column is missing in Neon, run:

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS name VARCHAR(100);

UPDATE users
SET name = 'User'
WHERE name IS NULL;
```

This ensures that older users still have a valid display name.

---

## Database models

### User model

The user model stores:

- id
- name
- email
- password
- timezone
- createdAt
- updatedAt

File: [backend/models/User.js](backend/models/User.js)

### Habit model

The habit model stores:

- id
- userId
- name
- description
- createdAt
- updatedAt

### Check-in model

The check-in model stores:

- id
- habitId
- localDate
- createdAt
- updatedAt

---

## API overview

The backend exposes the following route groups:

### Authentication

- POST /api/auth/register
- POST /api/auth/login

### User profile

- GET /api/user
- PUT /api/user
- PUT /api/user/password
- DELETE /api/user

### Habits

- GET /api/habits
- POST /api/habits
- GET /api/habits/:habitId
- PUT /api/habits/:habitId
- DELETE /api/habits/:habitId

### Habit check-ins

- GET /api/habits/:habitId/check-ins
- POST /api/habits/:habitId/check-ins
- GET /api/habits/:habitId/streak

### Analytics

- GET /api/analytics/overview
- GET /api/analytics/habits
- GET /api/analytics/daily

---

## Frontend behavior

The frontend is built around a protected route structure:

- public routes: login, register
- protected routes: dashboard, habits, analytics, settings

The app stores auth payload details in localStorage after login and reads them for protected navigation and user context.

---

## Production build

To create a production build for the frontend:

```bash
cd frontend
npm run build
```

The project root also contains a combined build command:

```bash
npm run build
```

This script installs both the backend and frontend dependencies and then builds the frontend.

---

## Deployment notes

For deployment:

1. set production environment variables in your hosting environment
2. ensure the PostgreSQL database is reachable and migrated
3. set JWT_SECRET to a secure production value
4. set frontend VITE_API_URL to your deployed backend URL
5. deploy the backend and frontend separately or behind a unified hosting setup

---

## Troubleshooting

### The app says name column does not exist

This usually means the database schema and app code are out of sync.

Fix:

```bash
cd backend
npx sequelize-cli db:migrate --env production
```

If your existing DB is already live, add the column manually if needed:

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS name VARCHAR(100);
```

### Login or registration fails unexpectedly

Check:

- JWT_SECRET is set in the backend .env
- DATABASE_URL is valid
- PostgreSQL is reachable
- migrations are applied

### Frontend cannot reach backend

Verify:

- frontend .env contains the correct VITE_API_URL
- backend is running on the expected port
- CORS is configured for the frontend domain

---

## Recommended project workflow

1. install backend and frontend dependencies
2. configure environment variables
3. run database migrations
4. start backend and frontend services
5. create a user account
6. verify dashboard, settings, and analytics work correctly
7. run a production frontend build before release

---

## Notes

This project is designed to be a modern productivity app with a clean structure and modular backend architecture. It is suitable for local development and can be extended with features like reminders, reusable templates, weekly goals, team-based collaboration, notifications, or mobile app support in future iterations.

---

## License

This project currently does not declare a formal license in the package metadata. If you plan to distribute or share it publicly, it is recommended to add a proper license file and update the project metadata accordingly.

---

## Final reminder

Before using the app with a live database, always make sure the schema is migrated and the environment variables are correct. The most common issue in this project is a database/schema mismatch, especially after the `name` field was introduced.
