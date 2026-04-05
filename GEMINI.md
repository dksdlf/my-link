# GEMINI.md

This file defines the project structure, tech stack, development rules, and User Experience (UX) guidelines for MyLink. All tasks must prioritize these instructions to maintain a consistent architecture and design system.

## 1. Project Overview
**MyLink** is a unified link collection service for developers and creators. It allows users to gather scattered activities (GitHub, blog, portfolio, etc.) into a single, clean page (`mylink.com/nickname`).

- **Core Values**: Simplicity, intuitive inline editing, and automated metadata collection.
- **Key Features**: Google Social Login, nickname-based unique URLs, real-time link editing, and SEO optimization.

## 2. Tech Stack
- **Framework**: Next.js (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn UI (Radix UI)
- **Backend/Database**: Firebase (Authentication, Firestore) - *Planned/In-progress per @docs/PRD.md*
- **Icons**: Hugeicons
- **Fonts**: Geist, Geist Mono (font-sans, font-mono)

## 3. Directory Structure
- `@app/`: Routing and layout definitions (`@app/layout.tsx`, `@app/page.tsx`).
- `@components/`: Shared components (Shadcn UI located under `@components/ui/`).
- `@docs/`: PRD, DB Schema, Wireframes, and User Scenario documents.
- `@hooks/`: Custom React hooks for Firebase integration and state management.
- `@lib/`: Utility functions and Firebase configuration (`@lib/utils.ts`).
- `@public/`: Static assets and icons.

## 4. Building and Running
- `npm run dev`: Run development server (Turbopack).
- `npm run build`: Generate production build.
- `npm run start`: Run production server.
- `npm run lint`: ESLint code quality check.
- `npm run format`: Prettier code formatting (`ts, tsx`).
- `npm run typecheck`: TypeScript type check.

## 5. Development & Architecture Guidelines

### 5.1 Data Modeling & Authentication
- **Firebase Auth**: Only Google Social Login is supported. Initial nicknames are auto-generated from Gmail IDs upon signup.
- **Firestore Structure** (Follows @docs/DB_SCHEMA.md):
  - `users/{uid}`: Stores email, nickname, username, bio, avatar URL, etc.
  - `users/{uid}/links`: Sub-collection for individual link data (title, URL).
  - `nicknames/{nickname}`: Unique mapping collection to prevent URL duplication.

### 5.2 UI/UX Design Principles
- **Single Theme**: Fixed Shadcn UI-based simple and modern layout. No theme-switching features.
- **Inline Editing**: Dashboard allows immediate editing by clicking text areas (converts to Input), auto-saving on `Enter` or `Blur`. (Refer to @docs/WIREFRAME.md)
- **Favicon Automation**: Use `Google Favicon API` (`s2.googleusercontent.com/s2/favicons?domain=...`) to dynamically render external link icons.
- **Responsive Design**: Mobile-first, center-aligned card layout.

### 5.3 User Scenarios & Flow
- **Landing**: Minimize friction with clear copy and a single Google Login button.
- **Admin**: Copy my URL, edit profile (nickname/username/bio), add/edit/delete links. (Follows @docs/USER_SCENARIO.md)
- **Public**: Optimized link list for visitors and "Create my MyLink" conversion button.
- **404**: Custom error page with a signup conversion button for invalid nicknames.

## 6. References
- Product Requirements (PRD): @docs/PRD.md
- Database Schema: @docs/DB_SCHEMA.md
- Wireframes: @docs/WIREFRAME.md
- User Scenarios: @docs/USER_SCENARIO.md
