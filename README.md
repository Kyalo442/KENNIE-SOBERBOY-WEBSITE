# KB Graphics Website

Premium multi-page KB Graphics website with static frontend pages and backend-ready Node/Express examples.

## Structure

- `frontend/` contains the HTML, CSS, and modular JavaScript website.
- `backend/` contains Express route examples, auth middleware, upload handling, and service stubs.
- `database/schema.sql` defines the relational data model.
- `api/README.md` lists endpoint examples.
- `workers/` contains background job examples for uploads, notifications, and invoices.

## Local Frontend Preview

From the project root:

```bash
npx http-server frontend -p 8080
```

Then open `http://localhost:8080`.

## Backend Preview

From `backend/`:

```bash
npm install
npm run dev
```

The API starts at `http://localhost:4000`.
