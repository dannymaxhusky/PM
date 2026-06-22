# Internal PM Platform

A lightweight internal project management platform inspired by Plane's workflow model, built for Netlify and Netlify Database.

## Modules

- Configuration: people, budgets, fiscal calendar, portfolios, sub-projects.
- Operations: project status, progress, risk, milestones, budget consumption, notes.
- Reports: portfolio overview with filters by fiscal period, portfolio, owner, status, and risk.

## Netlify Database

This project uses Netlify Database directly through `@netlify/database`.

- Schema migrations live in `netlify/database/migrations`.
- API access is handled by `netlify/functions/workspace.js`.
- Netlify provisions the database and applies migrations during deploy.

## Local Development

```bash
npm install
npm run dev
```

For local Netlify Database emulation:

```bash
npm run netlify:dev
```

## Deployment

Connect this repository to Netlify. The build command is `npm run build` and the publish directory is `dist`.
