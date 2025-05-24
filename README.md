# ABIS - Fullstack PERN Authentication App

![CI](https://github.com/CHIBUZOR-1/ABIS/actions/workflows/deploy.yml/badge.svg)
![License](https://img.shields.io/github/license/CHIBUZOR-1/ABIS)
![Issues](https://img.shields.io/github/issues/CHIBUZOR-1/ABIS)
![PRs](https://img.shields.io/github/issues-pr/CHIBUZOR-1/ABIS)
![Made With PERN](https://img.shields.io/badge/stack-PERN-blueviolet)

**ABIS** is a robust and modern fullstack authentication system built using the PERN stack with Supabase's Postgres as the database. It provides essential auth features like user registration, login, password reset, and secure route access, all wrapped in a responsive and clean UI powered by Ant Design and React.

## 🌐 Live Demo

🔗 [https://abis.onrender.com](https://abis.onrender.com)

---

## 🚀 Features

- User registration & login
- Password reset via email (with Nodemailer)
- JWT-based authentication
- Secure cookie handling
- Input validation
- Profile image upload via Cloudinary
- Responsive UI with Ant Design
- Protected routes with token verification
- Full test coverage (unit, integration, E2E)
- Painless dev & build process with `concurrently`
- Cypress for E2E tests, Vitest & Jest for unit/integration

---

## Project Structure
```bash
ABIS/
├── backend/
│   ├── Controller/
│   ├── Routes/
│   ├── Utilities/
│   ├── __tests__/
│   ├── index.js
│   └── db.js
├── frontend/
│   ├── src/
│   ├── public/
│   ├── cypress/
│   └── vite.config.js
├── .github/workflows/
│   └── ci.yml (Cypress CI config)
└── README.md
```


## 🛠 Tech Stack

### 🧠 Frontend

- React 18
- React Router DOM
- Redux Toolkit + Redux Persist
- Ant Design
- Axios
- TailwindCSS
- React Toastify
- Helmet Async
- React Icons

#### Frontend Dev & Testing

- Vite
- Cypress (E2E)
- Vitest
- React Testing Library
- jsdom
- redux-mock-store

---

### 🖥 Backend

- Express.js
- Supabase (PostgreSQL)
- bcryptjs
- Cloudinary
- Multer
- Nodemailer
- JWT (jsonwebtoken)
- Helmet
- CORS
- Validator
- Morgan

#### Backend Dev & Testing

- Nodemon
- Jest
- Supertest
- node-mocks-http

---

## 🧪 Testing Overview

- **Backend**: Jest & Supertest for controller and utility unit tests
- **Frontend**: Vitest + React Testing Library for component testing
- **E2E**: Cypress for full end-to-end auth flows

---

## 📦 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Supabase project (credentials in `.env`)
- Cloudinary account for image uploads

---

### 🖥 Local Development

1. **Clone the repo**

```bash
git clone https://github.com/CHIBUZOR-1/ABIS.git
cd ABIS
```

## Frontend
```bash
$ cd frontend # go to frontend folder
$ npm install # install packages
```
## Backend
```bash
$ cd Backend # go to backend folder
$ npm install # install packages
$ npm run server # starts both services App locally with concurrently
```
## Run Tests
### Frontend
```bash
$ cd frontend
$ npm vitest run # for integration tests
```
### Backend
```bash
$ cd Backend
$ npm test # for integration tests
```
### Cypress E2E tests
```bash
cd frontend
npx cypress open
```

## Environment variables
```bash
SUPABASE_URL=...
SUPABASE_KEY=...
JWT_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## 🧑‍💻 Author

**Chibuzor Henry Amaechi** — built ABIS as a fullstack authentication showcase with CI/CD, testing, and modern tooling.

## 📝 License

This project is licensed under the MIT License.