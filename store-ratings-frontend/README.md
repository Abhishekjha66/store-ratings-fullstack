# Store Ratings Frontend

React + Vite frontend for the NestJS/Prisma Store Ratings backend included in the supplied project archive.

## Requirements
- Node.js 18.18+ (Node 20 LTS recommended)
- The NestJS backend running at `http://localhost:3000`

## Setup

1. Open a terminal in this folder (`store-ratings-frontend`).
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file by copying `.env.example` (the default API URL is already correct for local development):

   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. Start the frontend:

   ```bash
   npm run dev
   ```

5. Open the local URL printed by Vite, normally `http://localhost:5173`.

## Build check

```bash

npm run build
```

## Backend API used

- `POST /auth/signup`
- `POST /auth/login`
- `GET /users` (ADMIN JWT)
- `DELETE /users/:id` (ADMIN JWT)
- `GET /stores`
- `GET /stores/:id`
- `POST /stores`
- `GET /ratings`
- `POST /ratings`

The frontend deliberately uses the existing backend contracts and does not require backend source changes.

## Important backend limitations

The supplied backend currently does not apply authentication/role guards to store and rating routes. The UI only displays role-appropriate pages; this is not a security boundary. Protect those endpoints in the backend before deploying publicly.

The current ratings API accepts `userId` in the request body and returns IDs rather than customer names. The frontend sends the signed-in user's ID from the login response and displays user IDs in the admin ratings table.

The store-owner page discovers owned stores by checking `ownerId` from `GET /stores/:id`; if no store is assigned to the signed-in owner's ID, it shows an empty state. The current backend has no dedicated store-owner endpoint.

The backend JWT expires after 15 minutes. If a request returns 401, sign in again to obtain a fresh token.
