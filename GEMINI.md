# GEMINI.md - my-link Project Context

This file provides context and instructions for AI agents working on the `my-link` project.

## Project Overview

`my-link` is a workspace that currently contains a Next.js application named `my-profile`. It is designed as a personal profile or landing page.

### Core Technologies
- **Framework:** [Next.js 16.2.1](https://nextjs.org/) (App Router)
- **Library:** [React 19.2.4](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Runtime:** Node.js

### Architecture
- The main application logic resides in the `my-profile/` directory.
- **Routing:** Utilizes the Next.js App Router (`my-profile/app/`).
- **Styles:** Global styles are defined in `my-profile/app/globals.css`, and Tailwind CSS is configured via PostCSS.
- **Fonts:** Uses Vercel's Geist and Geist Mono fonts.

## Getting Started

All commands should be executed within the `my-profile/` directory.

### Commands
- **Development Server:** `npm run dev` - Starts the development server with Hot Module Replacement (HMR).
- **Build:** `npm run build` - Creates an optimized production build.
- **Start:** `npm run start` - Starts the production server after building.
- **Lint:** `npm run lint` - Runs ESLint to check for code quality issues.

## Development Conventions

- **Component Structure:** Prefer functional components with TypeScript interfaces for props.
- **Styling:** Use Tailwind CSS utility classes directly in JSX/TSX files.
- **File Naming:** Follow Next.js App Router conventions (e.g., `page.tsx`, `layout.tsx`, `loading.tsx`).
- **Imports:** Use absolute imports if configured in `tsconfig.json` (currently using relative paths).

## Key Files
- `my-profile/app/page.tsx`: The main landing page component.
- `my-profile/app/layout.tsx`: The root layout shared across all pages.
- `my-profile/package.json`: Project dependencies and scripts.
- `my-profile/next.config.ts`: Next.js configuration.
