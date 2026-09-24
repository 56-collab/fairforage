# FairForge — Intelligent Team Contribution & Workload Management Platform

FairForge is a modern MERN-stack collaborative project management platform designed for student and software development teams to balance workloads, organize tasks, and track transparent team contributions.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Axios, Lucide Icons, Modern Glassmorphism CSS
- **Backend**: Node.js, Express.js, REST API, JSON Web Tokens (JWT), Bcrypt password hashing
- **Database**: MongoDB + Mongoose (with automated in-memory fallback for instant development)

---

## 📁 Project Structure

```
fairforge/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── api/            # Axios API client with JWT interceptors
│   │   ├── components/     # Glassmorphic UI components (Navbar, Cards, Modals)
│   │   ├── context/        # AuthContext state management
│   │   ├── pages/          # Landing, Login, Register, Dashboard, Project Details
│   │   ├── App.jsx         # App routing & protected route wrappers
│   │   ├── index.css       # Glassmorphism Design System & responsive tokens
│   │   └── main.jsx        # App entrypoint
│   ├── index.html
│   └── vite.config.js      # Vite dev server with proxy to backend
│
└── server/                 # Express Backend API
    ├── config/
    │   └── db.js           # Mongoose MongoDB connection & fallback
    ├── middleware/
    │   └── authMiddleware.js # JWT protection middleware
    ├── models/
    │   ├── User.js         # User model with bcrypt encryption
    │   └── Project.js      # Project & Team member model
    ├── routes/
    │   ├── auth.js         # /api/auth (register, login, me)
    │   └── projects.js     # /api/projects (CRUD operations)
    ├── .env                # Server environment configuration
    └── index.js            # Express server entrypoint
```

---

## ⚡ Quick Start

### 1. Run Backend Server
```bash
cd server
npm run dev
```
Backend API will start on: `http://localhost:5000`

### 2. Run Frontend Client
```bash
cd client
npm run dev
```
Frontend Web App will start on: `http://localhost:5173`

---

## 🔑 Demo Account Credentials

- **Email**: `alex@fairforge.dev`
- **Password**: `fairforge123`

*(You can also use the **"Auto-fill demo credentials"** button directly on the login / register forms!)*
