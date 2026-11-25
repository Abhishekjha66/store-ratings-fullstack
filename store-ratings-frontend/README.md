# Store Ratings — Frontend

The frontend for the Store Ratings Platform, built using React and Vite. It provides an interface for users, administrators, and store owners to interact with the platform.

**Live Application:** https://store-ratings-fullstack-nine.vercel.app

**Backend API:** https://store-ratings-fullstack.onrender.com

## Features

- Login and user registration
- Role-based dashboards
- Store discovery and browsing
- Store ratings and reviews
- Admin user and store management
- Responsive user interface
- Integration with the NestJS REST API

## Tech Stack

- React.js
- Vite
- JavaScript
- CSS
- REST API integration

## Project Structure

```text
store-ratings-frontend/
├── src/
│   ├── App.jsx
│   ├── api.js
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
└── README.md
```

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/Abhishekjha66/store-ratings-fullstack.git
cd store-ratings-fullstack/store-ratings-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Start development server

```bash
npm run dev
```

The frontend will be available at the local URL displayed by Vite, typically `http://localhost:5173`.

## Production

The frontend is deployed on Vercel and communicates with the backend deployed on Render.

## Author

**Abhishek Jha**

- GitHub: https://github.com/Abhishekjha66
- LinkedIn: https://www.linkedin.com/in/abhishekjha66-tech66/

---

*Frontend developed for the Store Ratings Full-Stack Platform.*
