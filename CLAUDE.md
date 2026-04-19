# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on http://localhost:8089
npm run build:prod   # Production build
npm run build:stage  # Staging build with gzip compression
npm run preview      # Preview the built bundle
```

No test or lint scripts are configured.

The dev proxy at `/dev-api` routes to `http://localhost:8080` (backend). The `.env.development` file sets `VITE_APP_BASE_API` to a remote server; change this or use the proxy alias as needed.

## Architecture Overview

**Stack:** Vue 3 (Composition API / `<script setup>`), Vite 5, Pinia, Vue Router 4, Element Plus, Axios

This is a RuoYi-based admin dashboard for an AI-powered equipment support Q&A system (装备综合保障智能问答系统). The key custom domains layered on top of the RuoYi base are: AI chat assistant, knowledge base management, equipment repair/fault tracing.

### Routing — two-tier model

- **Constant routes** (`src/router/index.js`): login, register, dashboard, assistant pages, error pages — always available
- **Dynamic routes**: fetched from the backend at login time, generated based on user roles/permissions, and registered via `router.addRoute()` inside `src/store/modules/permission.js`

`src/permission.js` is the global route guard. It:
1. Checks for a token (stored via `src/utils/auth.js`)
2. Fetches user info (`/getInfo`) on first navigation after login
3. Calls `generateRoutes()` which converts the backend menu tree into Vue Router route objects with dynamically-imported components

### State management (Pinia)

Stores live in `src/store/modules/`:
- `user.js` — token, user info, roles, permissions, login/logout
- `permission.js` — dynamic route generation, sidebar menu filtering
- `app.js` — sidebar collapsed state, device type, component size
- `settings.js` — theme/layout config + RAGFlow API endpoint config
- `dict.js` — system dictionary cache
- `tagsView.js` — open browser-tab-style views

### API layer

`src/utils/request.js` is the Axios instance. It injects the Bearer token and handles 401 redirects and common error toasts. All feature API modules in `src/api/` wrap this instance.

Key API subdirectories:
- `api/app/` — assistant chat (`ops.js`), sessions, messages
- `api/kb/` — knowledge base CRUD
- `api/system/` — users, roles, dicts (RuoYi standard)
- `api/repair/`, `api/monitor/`, `api/tool/` — domain modules

**RAGFlow integration** uses a separate Axios instance at `src/utils/ragflowReq.js`. Its `baseURL` is `VITE_APP_RagFlow_API` (env var), but the actual URL is fetched at runtime from the backend system config key `RagFlowServerBaseUrl` (stored in `settings` store, `ragFlow_API` field). The RAGFlow API Bearer token is also dynamically fetched per-request from system config key `RagFlowKey`.

**Streaming AI responses** go through `requestStream()` in `api/app/ops.js` (a raw `fetch` POST to `/proxy/stream`). The `common.streamModelResponse()` helper in `src/utils/common.js` wraps the reader loop, SSE parsing, and `<think>` tag extraction. `common.packageAnswer()` converts the raw answer string (which may contain `<think>` blocks and citation markers like `##1$$` or `[ID:1]`) into rendered HTML via `markdown-it`.

### Component conventions

Global components registered in `src/main.js`: `Pagination`, `FileUpload`, `ImageUpload`, `ImagePreview`, `Editor`, `RightToolbar`, `DictTag`, `SvgIcon`. These can be used in any template without import.

Global properties on `app.config.globalProperties` (accessible as `this.$x` in Options API or via `getCurrentInstance` in Composition API):
- `$tab` — tab/page navigation helpers (e.g. `closeOpenPage`)
- `$auth` — permission checks
- `$cache` — session/local storage wrappers
- `$modal` — unified dialog/notification helpers
- `$download` — file download utilities
- `useDict`, `parseTime`, `resetForm`, `handleTree`, `addDateRange`, `selectDictLabel/s` — utility functions

Layout shell is `src/layout/index.vue` — wraps Navbar, Sidebar, AppMain, TagsView. Views rendered into `AppMain` via `<router-view>`.

Page views are under `src/views/`. Custom AI/KB features are in `src/views/customApp/`. Standard admin pages mirror the RuoYi structure under `system/`, `monitor/`, `tool/`.

SVG icons: place files in `src/assets/icons/svg/` and reference as `<svg-icon icon-class="filename" />`.

Vite plugins are configured in `vite/plugins/` and composed in `vite.config.js` via `createVitePlugins()`.

### Environment / build

| Env | Base API |
|-----|----------|
| development | `http://39.104.76.6:8099` (remote dev server) |
| staging | `/stage-api` (proxied by nginx) |
| production | `/prod-api` (proxied by nginx) |

Path alias `@` → `src/`, `~` → project root.
