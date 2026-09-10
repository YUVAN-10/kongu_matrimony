# Kongu Matrimony - Full-Stack Application

This repository is structured as a **Full-Stack Monorepo** containing two cleanly separated folders:
- **`client/`**: React 19 + Vite Admin Dashboard (Frontend)
- **`server/`**: Node.js + Express REST API (Backend)

---

## 📁 Monorepo Folder Structure

```text
kongu_admin/
├── client/                     # 🌐 Frontend React + Vite Admin Panel
│   ├── public/                 # Static assets & logos
│   ├── src/                    # React components, hooks, routes, services
│   │   ├── components/         # Modular UI & Feature components
│   │   ├── constants/          # Navigation menu and constants
│   │   ├── context/            # Auth & Notification providers
│   │   ├── hooks/              # Custom data fetching hooks
│   │   ├── layouts/            # Layout shells
│   │   ├── lib/                # Centralized REST API client (api.js)
│   │   ├── pages/              # Routed pages (Dashboard, Users, Privacy, etc.)
│   │   ├── routes/             # AppRoutes configuration
│   │   ├── services/           # Service layer
│   │   └── styles/             # Global Tailwind styles
│   ├── .env                    # Client environment (VITE_API_BASE_URL)
│   ├── package.json            # Frontend dependencies & scripts
│   └── vite.config.js          # Vite build config with code splitting
│
├── server/                     # 🚀 Backend Node.js & Express REST API
│   ├── middleware/             # JWT auth & security middlewares
│   ├── routes/                 # REST API endpoints (users, payments, etc.)
│   ├── .env                    # Server environment (PORT, JWT_SECRET)
│   ├── package.json            # Backend dependencies & scripts
│   └── server.js               # Express application entry point
│
├── package.json                # Root workspace runner scripts
└── README.md                   # Project documentation
```

---

## ⚡ Quick Start Commands (From Project Root)

### 1. Run Frontend (Client)
```bash
npm run client
# Or: npm run dev
```
*Accessible at: `http://localhost:5173`*

### 2. Run Backend (Server)
```bash
npm run server
```
*Accessible at: `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)*

### 3. Build Frontend for Production
```bash
npm run build
```
