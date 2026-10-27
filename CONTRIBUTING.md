# Contributing to TaskFlow

Thank you for your interest in contributing to **TaskFlow**! 🎉
This document explains the project conventions so your contributions blend in cleanly.

**Developed by Brijesh Mishra**

## Getting Started

1. Fork the repository and clone your fork:
   ```bash
   git clone https://github.com/<your-username>/taskflow.git
   cd taskflow
   ```
2. Install dependencies and set up the database:
   ```bash
   npm install
   cp .env.example .env
   npx prisma db push
   ```
3. Start the dev server and confirm everything works:
   ```bash
   npm run dev
   ```
4. Create a branch for your change:
   ```bash
   git checkout -b feature/my-awesome-feature
   ```

## Development Conventions

### Code style

- **TypeScript everywhere** — strict types; avoid `any`.
- Follow the existing folder structure:
  - API routes → `src/app/api/**`
  - Feature components → `src/components/taskflow/**`
  - UI primitives → `src/components/ui/**` (shadcn/ui)
  - Hooks → `src/hooks/`, shared libs/types → `src/lib/`
- Prefer shadcn/ui components over hand-rolling UI elements.
- Keep components focused; extract helpers when a file grows past ~300 lines.
- Run `npm run lint` before committing — the build must stay lint-clean.

### Backend changes

- Validate **every** request body with a zod schema.
- Guard every protected route with `getSessionUser()` from `src/lib/auth.ts`.
- Always scope database queries by `userId` — never trust client-supplied ownership.
- If you change `prisma/schema.prisma`, run `npx prisma db push` and include any regenerated client in your testing.

### Commit messages

Use concise, descriptive messages:

```
feat: add task search in list view
fix: clear completedAt when task leaves completed column
docs: expand API.md with stats endpoint examples
refactor: extract priority badge into shared component
```

## Submitting a Pull Request

1. Make your change with focused commits.
2. Test the affected flows in the browser (auth, board, list, dashboard).
3. Run `npm run lint`.
4. Push your branch and open a Pull Request describing:
   - **What** changed and **why**
   - Screenshots/GIFs for UI changes
   - Any breaking changes to the API or schema

## Reporting Bugs

Open a GitHub Issue with:

- Steps to reproduce (numbered)
- Expected vs actual behavior
- Screenshots and browser/OS info
- Relevant console/terminal output

## Feature Ideas

Check the Roadmap in [README.md](README.md#-roadmap--future-enhancements). If you want to pick one up, comment on the related issue first so work isn't duplicated.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
