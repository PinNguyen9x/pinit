# PinIt — Next.js Portfolio & Blog Platform

A full-stack portfolio and blog platform built with **Next.js 14**, **TypeScript**, and **Material UI**. Features a markdown-powered blog, a works/portfolio showcase with full CRUD, and JWT-based authentication.

---

## Features

- **Blog** — Markdown files with YAML front matter, syntax highlighting (Prism), table of contents, and SEO-optimized static pages
- **Works / Portfolio** — List, search, filter by tags, paginate or infinite-scroll, create/edit/delete with rich text editor and image upload
- **Authentication** — JWT stored in cookies, user profile cached in localStorage, protected routes with redirect-back flow
- **Admin Panel** — Add/edit work form with React Quill editor and Cloudinary image upload widget
- **SEO** — Per-page meta tags, Open Graph, canonical URLs via custom `<SEO />` component
- **ISR** — Home page revalidates every 60 seconds

---

## Tech Stack

| Category | Library / Tool |
|---|---|
| Framework | Next.js 14.2 |
| Language | TypeScript 5.5 |
| UI | Material UI (MUI) 5, Emotion |
| Forms | React Hook Form 7, Yup, @hookform/resolvers |
| Data Fetching | SWR 2.2, Axios 1.7 |
| Markdown | unified, remark-parse, remark-rehype, remark-prism, rehype-stringify |
| Rich Text Editor | React Quill 2 |
| Notifications | react-toastify |
| Scroll Detection | react-intersection-observer |
| Date Formatting | date-fns 3 |
| HTML Sanitization | sanitize-html |
| Linting / Formatting | ESLint 8, Prettier |

---

## Project Structure

```
pinit/
├── pages/                    # Next.js routes
│   ├── index.tsx             # Home (SSG + ISR)
│   ├── blog/
│   │   ├── index.tsx         # Blog list
│   │   └── [slug].tsx        # Blog detail (SSG)
│   ├── works/
│   │   ├── index.tsx         # Works list with pagination
│   │   ├── infinity-scroll.tsx  # Works list with infinite scroll
│   │   └── [workId]/
│   │       ├── index.tsx     # Add / Edit work form
│   │       └── details.tsx   # Work detail page
│   ├── login.tsx
│   └── api/
│       ├── [...path].ts      # Proxy all requests to backend API
│       ├── login.ts
│       └── logout.ts
│
├── components/
│   ├── common/               # Header, Footer, SEO, Auth wrapper
│   ├── layouts/              # MainLayout, AdminLayout, EmptyLayout
│   ├── form/                 # InputField, AutocompleteField, EditorField, PhotoField
│   ├── auth/                 # LoginForm
│   ├── post/                 # PostList, PostCard, RecentPost
│   └── work/                 # WorkList, WorkCard, WorkForm, WorkFilter, FeatureWork
│
├── hooks/                    # Custom SWR-based hooks
│   ├── use-auth.ts
│   ├── use-work-list.ts
│   ├── use-work-list-infinity.ts
│   ├── use-work-details.ts
│   ├── use-add-work.ts
│   └── use-tag-list.ts
│
├── api-client/               # Axios instance + typed API calls
│   ├── axios-client.ts
│   ├── auth-api.ts
│   ├── work-api.ts
│   ├── post-api.ts
│   └── tag-api.ts
│
├── models/                   # TypeScript interfaces
│   ├── auth.ts
│   ├── work.ts
│   ├── post.ts
│   └── api.ts
│
├── utils/                    # Helpers (markdown parser, theme, URL encoding)
├── constants/                # Keys, query keys, enum values
├── blog/                     # Markdown blog posts
└── public/                   # Static assets
```

---

## Blog Posts

| Slug | Topic |
|---|---|
| `enhance-frontend-performance-critical-rendering-path` | Critical Rendering Path optimization |
| `reactjs-interview-question` | React interview Q&A |
| `kafka-rabbitmq` | Message queue systems comparison |
| `kafka-technique-p1` | Kafka deep dive |
| `reactjs-techniques` | React patterns and techniques |
| `git-common-commands` | Git command reference |
| `reactjs-learning-path-2020` | React learning roadmap |
| `reactjs-interview-tips` | Interview preparation tips |

Blog posts live in `/blog/` as `.md` files with YAML front matter:

```yaml
---
slug: my-post-slug
title: Post Title
author: Pin Nguyen
date: '2025-01-01T00:00:00Z'
tags: [tag1, tag2]
thumbnailUrl: https://...
---
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install

```bash
npm install
# or
yarn
```

### Environment Variables

Create a `.env.local` file:

```env
API_URL=https://json-server-blog.vercel.app
HOST_URL=http://localhost:3000
```

### Run

```bash
npm run dev      # Development server at http://localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

---

## API Endpoints (Backend)

The app proxies all API calls through `/api/[...path].ts` to the backend.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/profile` | Get logged-in user profile |
| `POST` | `/api/login` | Login with credentials |
| `POST` | `/api/logout` | Logout |
| `GET` | `/api/works` | List works (supports `_page`, `_limit`, `title_like`, `tagList_like`) |
| `GET` | `/api/works/:id` | Get single work |
| `POST` | `/api/works` | Create work |
| `PATCH` | `/api/works/:id` | Update work |
| `DELETE` | `/api/works/:id` | Delete work |
| `GET` | `/api/tags` | List all tags |

---

## Authentication Flow

1. User submits credentials → `POST /api/login`
2. Server sets JWT in an HTTP-only cookie
3. `useAuth` hook reads profile from `GET /api/profile` via SWR
4. User info is cached in `localStorage` (`user_info` key) for instant rehydration
5. Protected pages check login status via `<Auth requireLogin />` wrapper
6. If not logged in, redirect to `/login?back_to=<encoded-path>`
7. After successful login, decode `back_to` and redirect back

---

## Key Architectural Patterns

- **Per-page layout**: Each page exports a `Layout` static property consumed in `_app.tsx`
- **SWR data hooks**: All server data fetched via custom `use-*` hooks wrapping `useSWR` / `useSWRInfinite`
- **API abstraction layer**: `api-client/` separates transport concern from UI
- **Markdown pipeline**: `gray-matter` parses front matter → `unified` + remark/rehype plugins convert to HTML
- **Form validation**: Yup schemas integrated via `@hookform/resolvers`
- **URL sync**: Work list filters are synced to query params via Next.js shallow routing

---

## Configuration

**`next.config.js`** — allowed image domains (Cloudinary, Unsplash, placeholder services), Content Security Policy

**`tsconfig.json`** — path aliases: `@/*` maps to project root, `@/api` maps to `api-client/`

**`.prettierrc`** — print width 100, single quotes, no semicolons, trailing commas
