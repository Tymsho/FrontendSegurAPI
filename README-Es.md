# 🛡️ SegurAPI — Cliente Web Frontend

> 🌐 **Idioma / Language:** [English](./README.md) | **Español**

Cliente web moderno para la gestión integral de pólizas de seguros, clientes y carteras de **SegurAPI**. Construido con **React 19**, **Vite 8**, **Tailwind CSS v4**, **TanStack Query v5** y soporte para notificaciones en tiempo real vía **WebSockets (STOMP)**.

---

## ✨ Características Principales

- **📊 Dashboard Analítico Interactivo:** KPIs en tiempo real, evolución histórica de facturación, distribución por compañía y ramo, y gráficos interactivos con **Recharts**.
- **👥 Gestión de Clientes:** Operaciones CRUD completas con paginación, búsqueda avanzada, normalización de datos fiscales/DNI argentinos e integración geográfica (provincias y localidades).
- **📄 Gestión de Pólizas y Archivos PDF:** Creación, edición, filtrado, ordenamiento y anulación de pólizas con carga y visualización directa de documentos PDF adjuntos.
- **🤖 Importación Inteligente de Carteras (Excel / CSV):** Carga masiva de carteras desde archivos `.xlsx`, `.xls` o `.csv` con mapeo automático de columnas asistido por IA (Google Gemini Flash / heurísticas locales) y caché de plantillas por aseguradora.
- **🔔 Notificaciones en Tiempo Real:** Alertas instantáneas sobre vencimientos de pólizas y eventos del sistema mediante **STOMP sobre WebSockets (`@stomp/stompjs` y `sockjs-client`)**.
- **🔐 Seguridad y Control de Roles:** Autenticación con JWT, rutas protegidas por rol (`ADMIN` y `PRODUCTOR`), panel de administración de usuarios y gestión de planes de suscripción (integración con **MercadoPago**).
- **🌓 Interfaz Moderna y Modo Oscuro:** Diseño responsivo construido con **Radix UI**, **Tailwind CSS v4**, **Lucide Icons** y selector de tema (`light` / `dark`).

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnologías |
| :--- | :--- |
| **Core** | React 19, Vite 8, React Router v7 |
| **Estado y Peticiones HTTP** | TanStack React Query v5, Axios |
| **Estilos y Componentes UI** | Tailwind CSS v4, Radix UI Primitives, Lucide React, Sonner (Toasts) |
| **Gráficos y Visualización** | Recharts v3 |
| **Tiempo Real** | `@stomp/stompjs`, `sockjs-client` |
| **Testing** | Vitest, React Testing Library, JSDOM |

---

## 📋 Requisitos Previos

Asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- Un gestor de paquetes como `npm` (incluido con Node.js)
- Una instancia en ejecución del **Backend de SegurAPI** (`SegurAPI-Spring`)

---

## 🚀 Guía de Inicio Rápido

Sigue estos pasos para levantar el proyecto localmente:

### 1. Clonar el repositorio e instalar dependencias
Entra al directorio `FrontendSegurAPI` y ejecuta:
```bash
cd FrontendSegurAPI
npm install
```

### 2. Configurar variables de entorno
1. Copia el archivo de ejemplo para crear tu archivo `.env` local:
   ```bash
   cp .env.example .env
   ```
2. Abre el archivo `.env` y ajusta las URLs si tu backend corre en un puerto o dominio distinto:
   ```env
   # URL base de la API REST del Backend
   VITE_API_URL=http://localhost:8080/api

   # URL base para acceder a los archivos/PDFs subidos
   VITE_BACKEND_URL=http://localhost:8080

   # Endpoint de WebSockets (STOMP) para notificaciones en tiempo real
   VITE_WS_URL=http://localhost:8080/ws
   ```

### 3. Iniciar el servidor de desarrollo
Para correr la aplicación en modo desarrollo con recarga rápida (HMR):
```bash
npm run dev
```
Por defecto, la aplicación estará disponible en [http://localhost:5173](http://localhost:5173).

---

## 🧪 Ejecución de Tests y Linter

Para ejecutar la suite de pruebas unitarias y de componentes con **Vitest**:
```bash
npm test
```

Para verificar la calidad del código con ESLint:
```bash
npm run lint
```

---

## 📦 Construcción para Producción

Si deseas compilar y optimizar la aplicación para producción:
```bash
npm run build
```
Esto generará los archivos estáticos optimizados dentro de la carpeta `dist/`. Puedes previsualizar la compilación localmente con:
```bash
npm run preview
```

---

## 📁 Estructura del Proyecto

```text
FrontendSegurAPI/
├── public/                 # Recursos estáticos
├── src/
│   ├── components/         # Modales reutilizables, layout y componentes base UI (Radix/Tailwind)
│   ├── context/            # AuthContext, NotificationContext (STOMP) y ThemeContext
│   ├── pages/              # Vistas principales (Dashboard, Clientes, Polizas, Reportes, UsuariosAdmin, Perfil, Login)
│   ├── services/           # Cliente Axios configurado y servicios por dominio
│   ├── App.jsx             # Configuración de rutas y proveedores de contexto
│   └── main.jsx            # Punto de entrada de la aplicación
├── .env.example            # Plantilla de variables de entorno
├── package.json            # Dependencias y scripts
└── vite.config.js          # Configuración de Vite
```

