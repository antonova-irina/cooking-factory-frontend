# Cooking Factory Frontend

A React application (React + TypeScript + Vite) for managing a cooking school: Instructors, Students, and Courses. Features JWT-based authentication, API integration with a backend, and Zod validation schemas.

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **React Router** (routing)
- **React Hook Form** + **Zod** (forms & validation)
- **Material React Table** (data tables)
- **Tailwind CSS** (styling)
- **Sonner** (toast notifications)
- **js-cookie** + **jwt-decode** (auth)

## Prerequisites

- Node.js 18+
- Running backend API (see backend repository)

## Setup

1. Clone the repository and enter the project folder:
   ```bash
   cd cooking-factory-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `VITE_API_URL` to the backend API base URL (e.g. `http://localhost:8080/api`).


4. Start the development server:
   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:3000` (or the port shown in the terminal).

## Available Scripts

| Command        | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start development server       |
| `npm run build`| Build for production           |
| `npm run preview` | Preview production build   |
| `npm run lint` | Run ESLint                     |

## Authentication

- **ADMIN** users can add and edit Courses, Students, and Instructors.
- **INSTRUCTOR** users can view all data but cannot add or edit.
- Login credentials are provided by your system administrator.

## Project Structure

```
src/
├── components/     # React components (layout, pages, UI)
├── context/        # Auth context & provider
├── hooks/          # Custom hooks (useAuth)
├── lib/            # Utilities (cn)
├── schemas/        # Zod schemas (courses, students, instructors, etc.)
├── services/       # API services (api.courses, api.students, etc.)
└── utils/          # Helpers (cookies)
```

## License

No license file found in the repository.
