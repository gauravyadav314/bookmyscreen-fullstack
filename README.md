# 🎬 BookMyScreen - Full-Stack Movie Booking Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5-blue.svg)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6_ReplicaSet-emerald.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-v7_Alpine-red.svg)](https://redis.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)

**BookMyScreen** is a modern, high-performance, real-time movie ticket booking web application built with React 19, Express.js, TypeScript, MongoDB Replica Set, Redis, and Socket.IO.

---

## ✨ Features

- **⚡ Real-Time Seat Locking**: 
  - Prevents double-booking by locking seats in Redis for 5 minutes when a user initiates checkout.
  - Live WebSocket broadcasts (`Socket.IO`) inform other active users in real-time when seats are locked/unlocked.
- **📅 Dynamic Showtime Generation**:
  - Automatically seeds and generates showtimes on-demand for **any date** selected in the calendar date-picker.
- **🍿 Interactive Seat & Snack Selection**:
  - Visual seat layout grid categorized by pricing tiers (PREMIUM, EXECUTIVE, NORMAL).
  - Food & Beverage addon checkout (Popcorn, Drinks, Nachos) with promo code discounts (`BMS50`, `WELCOME100`).
- **🎟️ Digital M-Ticket & QR Code Pass**:
  - Instant ticket generation with printable/downloadable digital QR passes upon confirmation.
- **👤 User Profile & Booking History**:
  - Dedicated user profile displaying account security details and full booking history linked to user accounts.
- **🛡️ Secure Authentication**:
  - OTP verification system, JWT access tokens, and HTTP-Only refresh cookies.
- **🌓 Dark & Light Mode Support**:
  - Seamless theme toggle across the entire application interface.

---

## 🛠️ Tech Stack

### **Frontend (`bms-frontend`)**
* **Framework**: React 19 (Vite)
* **Routing**: React Router DOM (v7)
* **Styling**: TailwindCSS (v4), React Icons, Swiper, React-Slick
* **State & Data Fetching**: TanStack React Query (v5) & React Context API
* **Real-time Client**: Socket.IO Client (v4)
* **HTTP Client**: Axios with refresh token interceptors
* **Date Utilities**: Day.js, Date-fns

### **Backend (`bms-backend`)**
* **Runtime & Framework**: Node.js, TypeScript, Express.js (v5)
* **Database**: MongoDB v6 (Mongoose 8) with **Replica Set (`rs0`)** for ACID session transactions
* **Cache & Locks**: Redis (`ioredis`) for 5-minute atomic seat locks with TTL
* **WebSockets**: Socket.IO Server (v4)
* **Security & Auth**: JWT, Cookie-Parser, CORS, Zod
* **Services**: Nodemailer & Mailgen for OTP email delivery, Razorpay SDK integration

---

## 📁 Project Structure

```text
bookMyScreen-master/
├── bms-frontend/             # React + Vite Client Application
│   ├── src/
│   │   ├── apis/             # Axios API wrapper and endpoints
│   │   ├── components/       # Modular UI components (Movies, Profile, SeatLayout)
│   │   ├── context/          # React Context Providers (AuthContext, SeatContext)
│   │   ├── pages/            # Page Views (Home, Checkout, Profile, SeatLayout)
│   │   └── utils/            # Socket instance, constants, and layout helpers
│   └── package.json
├── bms-backend/              # Express + TypeScript Server API
│   ├── src/
│   │   ├── config/           # DB, Redis, and environment configs
│   │   ├── modules/          # Domain modules (Auth, User, Movie, Theater, Show, Booking)
│   │   ├── scripts/          # Seeder scripts (Movies, Theaters, Shows)
│   │   ├── socket/           # Real-time Socket.IO room event handlers
│   │   └── server.ts         # Main server entrypoint
│   └── package.json
└── docker-compose.yml        # Docker composition for MongoDB Replica Set & Redis
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

---

### 1️⃣ Start Infrastructure (MongoDB Replica Set & Redis)

Run Docker Compose to spin up MongoDB (with replica set `rs0` initialized) and Redis:

```bash
docker-compose up -d
```

Verify services are running:
- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`

---

### 2️⃣ Backend Setup (`bms-backend`)

1. Navigate to the backend directory:
   ```bash
   cd bms-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in `bms-backend/`:
   ```env
   PORT=9000
   NODE_ENV=development
   DATABASE_URL=mongodb://localhost:27017/bookmyscreen
   DATABASE_REPLICA_SET=mongodb://localhost:27017/bookmyscreen?replicaSet=rs0
   REDIS_HOST=localhost
   REDIS_PORT=6379
   JWT_SECRET=your_jwt_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   ```

4. Seed initial database data (Theaters, Movies, Shows):
   ```bash
   npm run seed:theaters
   npm run seed:movies
   npm run seed:shows
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend will start listening on `http://localhost:9000`.*

---

### 3️⃣ Frontend Setup (`bms-frontend`)

1. Navigate to the frontend directory:
   ```bash
   cd ../bms-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

---

## 🔗 Key API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/send-otp` | Send OTP for email verification | ❌ |
| `POST` | `/api/v1/auth/verify-otp` | Verify OTP & issue access token | ❌ |
| `GET` | `/api/v1/movies` | Fetch all movies | ❌ |
| `GET` | `/api/v1/movies/recommended` | Fetch recommended movies | ❌ |
| `GET` | `/api/v1/shows` | Fetch shows by `movieId`, `state/city`, and `date` | ❌ |
| `POST` | `/api/v1/book` | Create confirmed movie booking | ✅ |
| `GET` | `/api/v1/book` | Fetch logged-in user's bookings | ✅ |
| `GET` | `/api/v1/users/me` | Fetch authenticated user profile | ✅ |

---

## ⚡ WebSocket Events (Socket.IO)

- `join-show` — User enters show seat layout room.
- `lock-seats` — User locks selected seats (holds lock in Redis for 5 minutes).
- `unlock-seats` — User releases locked seats or finishes checkout.
- `seat-locked` — Server broadcasts locked seats to all clients in the show room.
- `seat-unlocked` — Server broadcasts unlocked seats to all clients in the show room.

---

## 📄 License

This project is open-source under the [ISC License](LICENSE).
