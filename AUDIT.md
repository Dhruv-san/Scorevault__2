# SCOREVAULT — CODEBASE AUDIT & ENGINEERING PLAN

## Executive Summary
Scorevault is an Indian educational discovery, review, rating, and comparison platform for schools, colleges, and universities. The repository was generated using Google AI Studio as a single-page application (SPA) prototype built with React 19, Vite, Express, and Tailwind CSS v4, integrated with Google Gemini AI (`@google/genai`).

This audit evaluates the current architectural state, identifies critical bugs, architectural weaknesses, security vulnerabilities, and scalability limitations, and provides a prioritized engineering roadmap to transform Scorevault into a production-grade, secure, scalable product.

---

## 1. Architecture Overview

### Framework & Versions
- **Frontend Stack**: React 19.0.1, React DOM 19.0.1, Vite 6.2.3, `@tailwindcss/vite` 4.1.14, Tailwind CSS 4.1.14, Lucide React (`lucide-react` 0.546.0), Motion 12.23.24.
- **Backend Stack**: Node.js, Express 4.21.2, `@google/genai` 2.4.0, `dotenv` 17.2.3, `tsx` 4.21.0, `esbuild` 0.25.0.
- **TypeScript**: TS 5.8.2 (`tsconfig.json` target ES2022).

### Frontend Architecture & Layout
- **Routing & View Management**: Primitive state-based routing (`currentView` state in `App.tsx` switching between `'home'`, `'search'`, `'institution'`, `'compare'`, `'saved'`, `'city'`, `'category'`, `'admin'`). No URL slug/route sync (HTML5 History API or React Router is absent). Deep linking or browser back/forward navigation is non-functional.
- **Component Breakdown**:
  - `Header.tsx`, `Footer.tsx`, `MobileNav.tsx`, `AuthModal.tsx`, `Badge.tsx`, `StarRating.tsx`, `InstitutionCard.tsx` (Common)
  - `HeroSection.tsx`, `TrendingSection.tsx`, `TrustManifesto.tsx` (Home)
  - `SearchAndFilterView.tsx` (Search & Discovery, with grid and canvas-based map representation)
  - `InstitutionProfileView.tsx`, `WriteReviewModal.tsx`, `ReportReviewModal.tsx` (Institution details)
  - `CompareView.tsx` (4-institution side-by-side matrix)
  - `SavedInstitutionsView.tsx` (Bookmarks)
  - `CityHubView.tsx`, `CategoryHubView.tsx` (Landing hubs)
  - `AdminDashboardView.tsx` (Moderation)
  - `AIAdvisorModal.tsx` (AI Education Counselor)

### State Management & Data Layer
- **Client Storage**: All institutional data, user reviews, reports, bookmarks, and comparison selections reside in browser `localStorage` via `dataService.ts`.
- **Seed Data**: `src/data/seedData.ts` populates initial institutions, cities, and user state.
- **Authentication**: Simulated client-side session (`authService.ts`) with hardcoded default user ("Dhruv Verma"). Mock authentication methods (`loginWithEmail`, `loginWithGoogle`, `loginWithPhone`) write dummy tokens to `localStorage`.

### API & AI Engine Layer
- **Express Backend (`server.ts`)**:
  - Health check endpoint: `GET /api/health`
  - AI Advisor Endpoint: `POST /api/gemini/advisor` using `@google/genai` with two modes:
    1. **Thinking High Mode**: Uses `gemini-3.1-pro-preview` with `ThinkingLevel.HIGH` for deep comparative advice.
    2. **Search Grounded Mode**: Uses `gemini-3.5-flash` with Google Search tool grounding for real-time web verification.
- **Client AI Proxy**: `src/services/aiService.ts` wraps fetch calls to `/api/gemini/advisor`.

### Styling & UI Design System
- **Tailwind CSS v4**: Imported via `@tailwindcss/vite` in `src/index.css`.
- **Design Tokens**: Custom font family `font-display` and color palette based on Slate, Blue, Amber, Emerald, and Rose tones. Clean, modern typography and cards.

---

## 2. Identified Problems & Weaknesses

### A. Critical & Security Risks
1. **Unauthenticated Admin & Moderation Operations**: `AdminDashboardView.tsx` permits review moderation (approve/reject/flag) directly via client-side calls to `dataService.ts` without backend authorization or role checks.
2. **Lack of Backend API Boundaries**: Data mutations (adding reviews, voting, bookmarking, reporting) execute entirely in the user's browser local memory. Anyone can manipulate `localStorage` to overwrite ratings, scores, or fake verified status.
3. **Missing Input Sanitization**: Review text, titles, and report notes are rendered directly without XSS escaping or rich-text sanitization.
4. **Hardcoded User Session**: Default login session initializes automatically on load, exposing student identity across shared browsers.

### B. Architectural & Scalability Weaknesses
1. **No Real Database Persistence**: Data is limited to local storage quotas (~5MB) and per-device isolation.
2. **Lack of True URL Routing**: Changing views does not update browser location (`/institution/iit-bombay` or `/search?city=Lucknow`). Pages cannot be bookmarked, indexed by search engines, or shared via deep URLs.
3. **No SSR / Dynamic SEO**: Since all rendering happens client-side without open-graph tags or dynamic metadata, search engines cannot index institution profiles or review pages.
4. **Monolithic Data Service**: `dataService.ts` loads all institutions and reviews synchronously into memory at application boot, which will fail as the dataset grows to thousands of institutions across India.

### C. Search, SEO & Performance Issues
1. **Client-Side Filtering**: Search queries iterate through array filters client-side. Large datasets will stall main thread rendering.
2. **Unoptimized Assets**: High-resolution Unsplash image URLs are used without image optimization, responsive srcset, or blur placeholders.

### D. Quality, Testing & Error Handling
1. **Zero Automated Tests**: No unit, integration, or E2E tests exist (no Vitest / Jest / Playwright setup).
2. **Silent Failure Fallbacks**: `aiService.ts` swallows errors and returns generic static text without notifying users of network/API key failures.

---

## 3. Preservation List (Functionality That Works Well)

The following UI components and features are well-designed and MUST be preserved without visual redesign:
1. **Visual Brand Identity & Color Palette**: Slate-950 header/accent theme, Blue-600 action buttons, verified trust badges, and Tailwind v4 styling.
2. **AI Education Counselor Modal & Grounded Search Workflow**: The dual-mode (Gemini Thinking Pro + Search Grounded Flash) AI advice drawer.
3. **Side-by-Side Comparison Matrix (`CompareView.tsx`)**: 4-institution sticky comparison table with category breakdowns.
4. **Search & Discovery Layout (`SearchAndFilterView.tsx`)**: Dual view mode (Grid / Interactive Map distribution) and filter options sidebar.
5. **Institution Profile Layout (`InstitutionProfileView.tsx`)**: Tabbed structure (Overview, Ratings & Rubrics, Admissions & Info, Reviews, AI Dossier).
6. **Community Review Submission Workflow**: Review forms with pros/cons, rating rubrics, verified status indicators, and helpful voting.
7. **Admin / Moderation Dashboard (`AdminDashboardView.tsx`)**: Moderation queue interface for reported reviews.

---

## 4. Recommended Development Sequence (Implementation Roadmap)

### Phase 1: Foundation & Neon Database Integration
- **Neon PostgreSQL Setup**: Provision Neon Serverless Postgres instance. Define Prisma / Drizzle ORM schema for `User`, `Institution`, `Course`, `Review`, `ReviewReport`, and `SavedInstitution`.
- **Database Seeding**: Migrate seed data from `seedData.ts` into Neon DB with proper indexes on `city`, `category`, `type`, `slug`, and `rating`.

### Phase 2: Backend REST / Serverless API Layer
- **Express REST API Endpoints**:
  - `GET /api/institutions` (with pagination, full-text search, and relational filters)
  - `GET /api/institutions/:slug`
  - `GET /api/institutions/:id/reviews`
  - `POST /api/reviews` (authenticated & sanitized)
  - `POST /api/reviews/:id/vote`
  - `POST /api/reports`
  - `GET /api/admin/reports` & `PATCH /api/admin/reviews/:id` (protected by JWT / Admin authorization)
- **Authentication**: JWT / OAuth (Google / Phone) backend verification with session cookies or bearer tokens.

### Phase 3: URL Routing & Next.js App Router Transition
- **Framework Evolution**: Migrate SPA state routing to Next.js App Router (`/app/` router) or integrate React Router v7 with SSR support.
- **Dynamic Slugs & SEO**:
  - `/institutions/[slug]`
  - `/search?q=...&city=...`
  - `/compare?ids=...`
  - `/cities/[city]`
  - `/categories/[category]`
- **SEO & OpenGraph**: Generate dynamic HTML metadata (`generateMetadata`), JSON-LD schema markup for educational organizations (`Schema.org/EducationalOrganization`), and dynamic XML sitemaps (`sitemap.ts`).

### Phase 4: Production Hardening, Security & Testing
- **Security & Moderation**: Rate-limiting (`express-rate-limit`), CORS policies, input validation (`zod`), XSS sanitization (`DOMPurify` / `sanitize-html`).
- **Testing Infrastructure**: Vitest for service unit tests, React Testing Library for UI components, and Playwright for E2E workflows.
- **Error Boundaries & Resilience**: Sentry error tracking, graceful API retries, and skeleton loaders.

---

## 5. Summary of Files/Modules to Change

| Module / File Path | Type of Change | Goal / Impact |
| :--- | :--- | :--- |
| `server.ts` | Refactor / Expand | Implement Neon DB connections, REST API routes for CRUD operations, JWT middleware. |
| `src/services/dataService.ts` | Refactor | Transition from `localStorage` sync calls to async API client calls with React Query / SWR caching. |
| `src/services/authService.ts` | Refactor | Connect to secure backend auth endpoints (JWT cookies / tokens). |
| `src/App.tsx` | Refactor | Replace primitive state routing with Next.js App Router / React Router. |
| `src/components/admin/*` | Refactor | Guard with backend admin role verification. |
| `src/components/institution/WriteReviewModal.tsx` | Refactor | Submit reviews to backend API with server-side validation. |
| `prisma/schema.prisma` (New) | Addition | Neon DB schema definition for relational models. |
| `AUDIT.md` | Addition | Comprehensive audit document. |

---
*Audit completed successfully for Scorevault codebase.*
