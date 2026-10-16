# HealthDiscover Backend API

FastAPI backend powered completely by **PostgreSQL**:
- **PostgreSQL**: Relational storage for users, auth, doctors, hospitals, specialities, cities, and doctor-hospital affiliations.
- **Relational Integrity**: Foreign keys, unique constraints, and indexed queries for cities, clinical specialities, and consulting hospitals.
- **Authentication**: JWT authentication with Argon2/Bcrypt password hashing and role-based permissions (`patient`, `doctor`, `admin`).

---

## 🛠️ Requirements & Setup

### 1. Virtual Environment & Dependencies

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Credentials

In `.env` (or copied from `.env.example`), supply your PostgreSQL connection string:

```ini
# PostgreSQL (supports standard postgresql://, asyncpg format, and Neon URLs)
DATABASE_URL="postgresql+asyncpg://<username>:<password>@<host>:<port>/<database>"

# JWT Secret
JWT_SECRET_KEY="generate-with-openssl-rand-hex-32"
```

### 3. Seed Database (Optional)

Populate initial verified Pune & Mumbai hospitals, doctors, and specialities:

```bash
python -m app.db.seed
```

### 4. Run Development Server



```bash
cd backend
# 1. Activate the Python virtual environment
source .venv/bin/activate
# 2. Run the Uvicorn server with hot-reload
uvicorn app.main:app --reload --port 8000
```

- API Root: `http://localhost:8000/`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health Probe: `http://localhost:8000/api/v1/health`
- Doctors Directory: `http://localhost:8000/api/v1/doctors`
- Hospitals Directory: `http://localhost:8000/api/v1/hospitals`
- Cities & Specialities: `http://localhost:8000/api/v1/cities` & `/api/v1/specialities`

---

## 📁 Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py              # Dependencies (get_current_user, role guards)
│   │   └── v1/
│   │       ├── auth.py          # /api/v1/auth (signup, login, me)
│   │       ├── health.py        # /api/v1/health (probes Postgres connectivity)
│   │       ├── doctors.py       # /api/v1/doctors (relational filter: city, speciality, hospital)
│   │       ├── hospitals.py     # /api/v1/hospitals (city, state, services)
│   │       ├── directory.py     # /api/v1/cities, /api/v1/specialities
│   │       └── router.py        # V1 router aggregation
│   ├── core/
│   │   └── security.py          # Password hashing & JWT logic
│   ├── db/
│   │   ├── postgres.py          # SQLAlchemy async session, SSL normalizer, & table init
│   │   └── seed.py              # Database seeder for cities, doctors, & hospitals
│   ├── models/
│   │   ├── user.py              # User account & role model
│   │   ├── hospital.py          # Hospital facility model
│   │   ├── doctor.py            # Doctor specialist model
│   │   ├── affiliation.py       # Doctor-Hospital relational affiliation
│   │   ├── city.py              # Coverage city model
│   │   └── speciality.py        # Clinical speciality model
│   ├── schemas/
│   │   ├── user.py              # User Pydantic schemas
│   │   ├── doctor.py            # Doctor & Affiliation output schemas
│   │   ├── hospital.py          # Hospital output schemas
│   │   ├── directory.py         # City & Speciality schemas
│   │   ├── token.py             # JWT & token schemas
│   │   └── health.py            # Health probe schemas
│   ├── config.py                # Environment configuration
│   └── main.py                  # FastAPI entrypoint & lifespan
├── .env.example                 # Sample environment template
├── .env                         # Active configuration
├── .gitignore                   # Backend gitignore
└── requirements.txt             # Pinned Python dependencies
```
