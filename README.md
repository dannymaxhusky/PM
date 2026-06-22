# PM Platform

Internal SSG / EaaS project management workspace.

## Current App

The active frontend MVP lives in:

```text
ssg-pm-workspace/
```

It is a React + Vite app that includes:

- Plane-inspired workspace navigation
- Resource Ledger allocation matrix
- Month / Fiscal Year planning modes
- Project-driven person-day allocation
- Work item detail rail, comments, status updates, and new item modal
- Weekly steering, BCPF distribution, upcoming gates, and capacity calendar previews
- Clean initialization with no bundled internal reference data
- English / Chinese UI switching from the top-right toolbar

## Netlify

This repo includes `netlify.toml` at the root. Netlify can build from the `ssg-pm-workspace` base directory:

```toml
[build]
base = "ssg-pm-workspace"
command = "npm run build"
publish = "dist"
```

For persistence, use Netlify's own database product in the next backend/data pass. Supabase is intentionally not part of this project direction.

## Local Development

```bash
cd ssg-pm-workspace
npm install
npm run dev
```

Then open `http://127.0.0.1:5173/`.
