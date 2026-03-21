---
topic: Deployment Stack
category: platform
tags: [docker, api, frontend]
created: 2026-03-15
updated: 2026-03-20
---
## Stack
- Frontend: React with Vite and Tailwind.
- API: Express service exposing read-only operational data.
- Search: Separate indexing service for code and documents.

## Deployment Pattern
Services are containerized so a single compose file can reproduce the stack in local or staging environments.
