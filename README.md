# Kongu Matrimony - Admin Dashboard

This repository contains the **React 19 + Vite Admin Dashboard** for Kongu Matrimony, connecting to the external REST API backend (`https://9bbc6zsl-4000.inc1.devtunnels.ms`).

---

## 📁 Project Structure

```text
kongu_admin/
├── public/                 # Static assets & favicon
├── src/                    # React components, hooks, routes, services
│   ├── components/         # Modular UI & Feature components
│   ├── constants/          # Navigation menu and constants
│   ├── context/            # Auth & Notification providers
│   ├── hooks/              # Custom data fetching hooks
│   ├── layouts/            # Layout shells
│   ├── lib/                # Centralized REST API client (api.js)
│   ├── pages/              # Routed pages (Dashboard, Users, Approvals, Subscriptions, Payments, etc.)
│   ├── routes/             # AppRoutes & ProtectedRoute configuration
│   ├── services/           # API Service layer
│   └── styles/             # Global Tailwind CSS styles
├── .env                    # Environment config (VITE_API_BASE_URL)
├── package.json            # Dependencies & scripts
├── vite.config.js          # Vite build & proxy config
└── README.md               # Project documentation
```

---

## ⚡ Quick Start Commands

### 1. Start Development Server
```bash
npm run dev
```
*Accessible at: `http://localhost:5173`*

### 2. Build for Production
```bash
npm run build
```
