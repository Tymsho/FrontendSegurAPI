# 🛡️ SegurAPI — Frontend Web Client

> 🌐 **Language / Idioma:** **English** | [Español](./README-Es.md)

Modern web client for insurance policy, client, and portfolio management built for **SegurAPI**. Developed with **React 19**, **Vite 8**, **Tailwind CSS v4**, **TanStack Query v5**, and real-time notifications powered by **WebSockets (STOMP)**.

---

## ✨ Key Features

- **📊 Interactive Analytics Dashboard:** Real-time KPIs, historical billing evolution, insurance company/branch distribution, and customizable widgets using **Recharts**.
- **👥 Client Management:** Full CRUD operations with pagination, search, Argentine tax/DNI normalization, and geographic integration (provinces and localities).
- **📄 Policy Management & PDF Storage:** Create, edit, filter, sort, and cancel insurance policies with direct PDF attachment upload and preview.
- **🤖 Smart Portfolio Import (Excel / CSV):** Bulk import insurance portfolios from `.xlsx`, `.xls`, or `.csv` files with automatic AI-assisted column mapping (Google Gemini Flash / local heuristics) and dynamic template caching.
- **🔔 Real-Time Notifications:** Instant alerts for policy expirations and system events via **STOMP over WebSockets (`@stomp/stompjs` & `sockjs-client`)**.
- **🔐 Role-Based Access & Security:** JWT authentication, route protection (`ADMIN` and `PRODUCTOR` roles), user administration panel, and subscription plan management (**MercadoPago** integration).
- **🌓 Modern UI & Dark Mode:** Responsive interface built with **Radix UI**, **Tailwind CSS v4**, **Lucide Icons**, and theme switching (`light` / `dark`).

---

## 🛠️ Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Core** | React 19, Vite 8, React Router v7 |
| **State & Data Fetching** | TanStack React Query v5, Axios |
| **Styling & UI Components** | Tailwind CSS v4, Radix UI Primitives, Lucide React, Sonner (Toasts) |
| **Charts & Visualization** | Recharts v3 |
| **Real-Time Communication** | `@stomp/stompjs`, `sockjs-client` |
| **Testing** | Vitest, React Testing Library, JSDOM |

---

## 📋 Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) (v18+ or v20+ recommended)
- `npm` (included with Node.js)
- A running instance of the **SegurAPI Backend** (`SegurAPI-Spring`)

---

## 🚀 Quick Start Guide

Follow these steps to run the project locally:

### 1. Clone the repository & install dependencies
Navigate to the `FrontendSegurAPI` directory and install the packages:
```bash
cd FrontendSegurAPI
npm install
```

### 2. Configure environment variables
1. Copy the example environment file to create your local `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and adjust the URLs if your backend runs on a different port or domain:
   ```env
   # Base URL of the Backend REST API
   VITE_API_URL=http://localhost:8080/api

   # Base URL for accessing uploaded files/PDFs
   VITE_BACKEND_URL=http://localhost:8080

   # WebSocket (STOMP) endpoint for real-time notifications
   VITE_WS_URL=http://localhost:8080/ws
   ```

### 3. Start the development server
Run the application in development mode with Hot Module Replacement (HMR):
```bash
npm run dev
```
By default, the app will be available at [http://localhost:5173](http://localhost:5173).

---

## 🧪 Running Tests & Linting

Run the unit and component test suite with **Vitest**:
```bash
npm test
```

Run ESLint to verify code quality:
```bash
npm run lint
```

---

## 📦 Building for Production

To compile and optimize the application for production deployment:
```bash
npm run build
```
This generates the production-ready static assets inside the `dist/` directory. You can preview the production build locally with:
```bash
npm run preview
```

---

## 📁 Project Structure

```text
FrontendSegurAPI/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable modals, layout, and Radix/Tailwind UI primitives
│   ├── context/            # AuthContext, NotificationContext (STOMP), and ThemeContext
│   ├── pages/              # Application views (Dashboard, Clientes, Polizas, Reportes, UsuariosAdmin, Perfil, Login)
│   ├── services/           # Axios API client and domain service modules
│   ├── App.jsx             # Router configuration and context providers
│   └── main.jsx            # Application entry point
├── .env.example            # Environment variables template
├── package.json            # Dependencies and scripts
└── vite.config.js          # Vite bundler configuration
```
