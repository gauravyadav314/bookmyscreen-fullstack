<div align="center">

# 🎬 BookMyScreen - Full-Stack Movie Ticket Booking System

<p align="center">
  <b>A real-time, high-performance movie ticket booking platform built with React 19, Express.js, TypeScript, Redis, MongoDB Replica Set, and Socket.IO.</b>
</p>

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v6_ReplicaSet-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-v7_Alpine-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.io-v4-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)

</div>

<!-- START_AUTOMATED_STATS -->
> 🔄 **Live Auto-Updated Status**  
> 📅 **Last Synced**: `August 1, 2026 at 11:47 AM GMT+5:30`  
> 🎬 **Movies Catalog**: `12 Active Titles`  
> 🏙️ **Locations Supported**: `20 Cities across India`  
> 🎟️ **Available Showtimes**: `23,000+ Automated Real-Time Shows`  
> ⚡ **Redis Seat Lock TTL**: `300 Seconds (5 Minutes)`
<!-- END_AUTOMATED_STATS -->

---

## 🌟 Key Highlights

- **⚡ Real-Time Distributed Seat Locking**: Atomic 5-minute seat locks powered by Redis TTL (`setex`, `sadd`, `srem`) & Socket.IO room broadcasting to prevent race conditions and double bookings.
- **📅 Dynamic On-Demand Show Generator**: Automatically generates and populates showtimes in real-time for any requested date across all theaters.
- **🍿 Interactive Seat & Concession Checkout**: Category-based seating layout (`PREMIUM`, `EXECUTIVE`, `NORMAL`) and Food & Beverage addon integration with coupon discounts (`BMS50`, `WELCOME100`).
- **🎟️ Digital M-Ticket & Printable QR Pass**: Real-time generation of digital movie passes with printable QR codes for venue entry verification.
- **👤 User Profile & Booking History**: Linked account history displaying verified user passes, ticket details, seats, and transaction summaries.
- **🛡️ Enterprise Security & Auth**: Passwordless OTP authentication, JWT access tokens, HTTP-Only refresh cookies, and input validation via Zod.
- **🌓 Adaptive Dark & Light Modes**: Seamless visual themes tailored for modern aesthetic appeal across all screen sizes.

---

## 🏗️ Architecture & Data Flow

```text
┌─────────────────┐        WebSocket / Socket.IO        ┌──────────────────┐
│  React 19 Client │ ◄────────────────────────────────► │  Express Server  │
└────────┬────────┘   Real-Time Seat Locks & Unlocks    └────────┬─────────┘
         │                                                       │
         │  HTTP / REST API Calls                                │  ACID Session
         ▼                                                       ▼
┌─────────────────┐                                     ┌──────────────────┐
│  Axios & React  │                                     │ MongoDB Replica  │
│      Query      │                                     │    Set (rs0)     │
└─────────────────┘                                     └────────┬─────────┘
                                                                 │
                                                       5-Min TTL │ Seat Lock
                                                                 ▼
                                                        ┌──────────────────┐
                                                        │   Redis Cache    │
                                                        └──────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Usage / Details |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** + **Vite** | Fast Single Page Application (SPA) architecture |
| **Routing** | **React Router DOM v7** | Dynamic routes (`/shows/:showId/...`, `/profile/:id/:tab`) |
| **Styling & UI** | **TailwindCSS v4** | Modern dark/light UI design tokens & micro-animations |
| **State Management** | **TanStack React Query v5** | Server state caching, optimistic updates, & refetching |
| **Global State** | **React Context API** | `AuthContext`, `SeatContext`, `LocationContext`, `ThemeContext` |
| **Real-time WebSockets** | **Socket.IO (Client & Server)** | Real-time seat lock broadcasts (`io.to(showId)`) |
| **Backend Runtime** | **Node.js** + **TypeScript v5** | Strongly-typed RESTful API architecture |
| **Web Framework** | **Express.js v5** | Route controllers, middleware pipelines, and error handling |
| **Database & ODM** | **MongoDB v6** + **Mongoose 8** | Replica Set (`rs0`) for multi-document ACID transactions |
| **Caching & Locks** | **Redis (Alpine)** + **`ioredis`** | Atomic 5-minute temporary seat locks with auto-expiration |
| **Email Service** | **Nodemailer** + **Mailgen** | OTP email verification and confirmation receipts |
| **Security & Auth** | **JWT**, **Cookie-Parser**, **Zod** | Access/Refresh tokens and schema validation |

---

## 🔗 REST API Endpoints Specification

### 🔑 Authentication Module (`/api/v1/auth`)

| Method | Endpoint | Description | Access Level |
| :---: | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/send-otp` | Generate and dispatch OTP to user email | `Public` |
| `POST` | `/api/v1/auth/verify-otp` | Verify OTP & issue JWT authentication cookies | `Public` |
| `GET` | `/api/v1/auth/refresh-token` | Renew expired access token using refresh cookie | `Public` |
| `POST` | `/api/v1/auth/logout` | Revoke session and clear authentication cookies | `Protected` |

### 🎬 Movies & Shows Module (`/api/v1/movies` & `/api/v1/shows`)

| Method | Endpoint | Description | Access Level |
| :---: | :--- | :--- | :---: |
| `GET` | `/api/v1/movies` | Retrieve list of all available movies | `Public` |
| `GET` | `/api/v1/movies/recommended` | Retrieve recommended movie titles | `Public` |
| `GET` | `/api/v1/movies/:id` | Fetch specific movie details by ID | `Public` |
| `GET` | `/api/v1/shows` | Query shows by `movieId`, `date`, and `state/city` | `Public` |
| `GET` | `/api/v1/shows/:id` | Retrieve show details and current seat layout | `Public` |

### 🎟️ Bookings & User Module (`/api/v1/book` & `/api/v1/users`)

| Method | Endpoint | Description | Access Level |
| :---: | :--- | :--- | :---: |
| `POST` | `/api/v1/book` | Create confirmed movie ticket booking | `Protected` |
| `GET` | `/api/v1/book` | Fetch all bookings for the authenticated user | `Protected` |
| `GET` | `/api/v1/users/me` | Retrieve authenticated user profile | `Protected` |
| `PUT` | `/api/v1/users/activate/:id` | Complete user account activation profile | `Protected` |

* **`Public`**: Accessible by anyone (no login required).
* **`Protected`**: Requires a valid authenticated JWT user session.

---

## ⚡ WebSocket Real-Time Events (Socket.IO)

| Event Name | Direction | Payload | Description |
| :--- | :---: | :--- | :--- |
| `join-show` | `Client -> Server` | `{ showId }` | Subscribes socket client to the show's room channel |
| `lock-seats` | `Client -> Server` | `{ showId, seatIds, userId }` | Requests atomic 5-minute Redis lock for selected seats |
| `unlock-seats` | `Client -> Server` | `{ showId, seatIds, userId }` | Releases locked seats upon cancellation or booking |
| `locked-seats-initials` | `Server -> Client` | `{ seatIds }` | Sends initial list of active locked seats upon joining room |
| `seat-locked` | `Server -> Client` | `{ showId, seatIds, userId }` | Broadcasts newly locked seats to all users in room |
| `seat-unlocked` | `Server -> Client` | `{ showId, seatIds, userId }` | Broadcasts released seats to all users in room |
| `seat-locked-failed` | `Server -> Client` | `{ showId, requested, alreadyLocked }` | Notifies user if requested seats are already taken |

---

## 🚀 Local Development Setup

### 1️⃣ Prerequisites
- **Node.js** (v18.0.0 or higher)
- **Docker** & **Docker Compose**

### 2️⃣ Clone & Setup Infrastructure

```bash
# Clone the repository
git clone https://github.com/gauravyadav314/bookmyscreen-fullstack.git
cd bookmyscreen-fullstack

# Start MongoDB Replica Set and Redis containers
docker-compose up -d
```

### 3️⃣ Backend Setup & Database Seeding

```bash
cd bms-backend

# Install dependencies
npm install

# Create environment configuration file (.env)
cat <<EOT > .env
PORT=9000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/bookmyscreen
DATABASE_REPLICA_SET=mongodb://localhost:27017/bookmyscreen?replicaSet=rs0
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_access_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
EOT

# Seed database with sample Theaters, Movies, and Shows
npm run seed:theaters
npm run seed:movies
npm run seed:shows

# Start Backend server
npm run dev
```
*Backend API server will listen on `http://localhost:9000`.*

### 4️⃣ Frontend Setup

```bash
cd ../bms-frontend

# Install dependencies
npm install

# Start Frontend application
npm run dev
```
*Open `http://localhost:5173` in your browser.*

---

## 📄 License

This repository is licensed under the [ISC License](LICENSE).
