# HealthDiscover Backend API (Node.js & Express.js REST API)

High-performance REST API backend built with **Node.js, Express.js, TypeScript, and Neon PostgreSQL**:
- **PostgreSQL (Neon)**: Complete relational database for users, auth, doctors, hospitals, diagnostic laboratories, wellness centers, specialities, cities, and doctor-hospital affiliations.
- **Ultra-Low Latency (<1ms)**: Implements an in-memory indexed directory store (`DirectoryDataStore`), ETag 304 validation, and GZip compression.
- **Authentication**: JWT authentication with Bcrypt password hashing and role-based permissions (`patient`, `doctor`, `admin`) via HttpOnly SameSite cookies or Bearer tokens.
- **API Parity**: 100% exact route compatibility with the frontend.

---

## 🛠️ Quickstart

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment (`.env`)
The database connection string and application settings are configured in `.env`:
```ini
PROJECT_NAME="HealthDiscover API"
ENVIRONMENT="development"
PORT=8000
DATABASE_URL="postgresql://neondb_owner:npg_...-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET_KEY="replace-this-with-a-secure-random-secret-key"
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
```

### 3. Start Development Server
```bash
npm run dev
```
The server will start on `http://localhost:8000`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📡 Core API Endpoints

- **Root Info**: `GET http://localhost:8000/`
- **Health Check**: `GET http://localhost:8000/api/v1/health`
- **Cache Status**: `GET http://localhost:8000/api/v1/cache/status`
- **Hospitals Directory**: `GET http://localhost:8000/api/v1/hospitals`
- **Single Hospital**: `GET http://localhost:8000/api/v1/hospitals/:slug`
- **Doctors Directory**: `GET http://localhost:8000/api/v1/doctors`
- **Single Doctor**: `GET http://localhost:8000/api/v1/doctors/:slug`
- **Laboratories Directory**: `GET http://localhost:8000/api/v1/laboratories`
- **Wellness Centers**: `GET http://localhost:8000/api/v1/wellness-centers`
- **Cities & Specialities**: `GET http://localhost:8000/api/v1/cities` & `/api/v1/specialities`
- **Auth**: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`
