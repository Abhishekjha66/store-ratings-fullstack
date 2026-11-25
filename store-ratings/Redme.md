# Store Ratings Platform

A full-stack web application that allows users to discover stores, submit ratings, and manage store information through role-based access control.

**Live Demo:** https://store-ratings-fullstack-nine.vercel.app

**Backend API:** https://store-ratings-fullstack.onrender.com

## Features

- JWT-based authentication and authorization
- Role-based access for Admin, User, and Store Owner
- Secure user registration and login
- Store listing and store management
- Submit and manage store ratings
- Admin dashboard and user management
- PostgreSQL database with Prisma ORM
- REST API built with NestJS

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React.js, Vite |
| Backend | NestJS, Node.js |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Authentication | JWT, Passport.js |
| Deployment | Vercel, Render |

## Project Structure

```text
store-ratings-fullstack/
├── store-ratings/
│   ├── prisma/
│   ├── src/
│   ├── package.json
│   └── prisma.config.ts
│
└── store-ratings-frontend/
    ├── src/
    ├── public/
    └── package.json
```

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Abhishekjha66/store-ratings-fullstack.git
cd store-ratings-fullstack
```

### 2. Backend setup

```bash
cd store-ratings
npm install
```

Create a `.env` file in the backend directory:

```env
DATABASE_URL="your_postgresql_connection_string"
JWT_SECRET="your_secure_random_secret"
```

Generate Prisma Client and build the backend:

```bash
npx prisma generate
npm run build
npm run start:dev
```

### 3. Frontend setup

Open another terminal:

```bash
cd store-ratings-frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

## Deployment

- Frontend hosted on Vercel
- Backend hosted on Render
- PostgreSQL hosted on Neon

## Author

**Abhishek Jha**

- GitHub: https://github.com/Abhishekjha66
- LinkedIn: https://www.linkedin.com/in/abhishekjha66-tech66/

---

*Built as a full-stack software development project.*
