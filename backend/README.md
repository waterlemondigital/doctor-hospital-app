# HealthDiscover Backend API

FastAPI backend with:
- **PostgreSQL**: User accounts, credentials, profiles, and authentication state.
- **Neo4j**: Graph database for hospitals, consulting doctors, specialties, departments, affiliations, and spatial relationships.
- **Authentication**: JWT authentication with password hashing and role-based permissions (`patient`, `doctor`, `admin`).

---

## 🛠️ Requirements & Setup

### 1. Create Virtual Environment

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Credentials

Open `.env` (or copy `.env.example` to `.env`) and supply your database credentials:

```ini
# PostgreSQL (asyncpg connection string)
DATABASE_URL="postgresql+asyncpg://<username>:<password>@<host>:<port>/<database>"

# Neo4j (Graph Database)
NEO4J_URI="bolt://localhost:7687"
NEO4J_USER="neo4j"
NEO4J_PASSWORD="your_password"
NEO4J_DATABASE="neo4j"

# JWT Secret
JWT_SECRET_KEY="generate-with-openssl-rand-hex-32"
```

### 4. Run Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API Root: `http://localhost:8000/`
- Interactive Swagger UI: `http://localhost:8000/docs`
- Health Probe: `http://localhost:8000/api/v1/health`

---

## 📁 Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── deps.py              # Dependencies (get_current_user, role guards)
│   │   └── v1/
│   │       ├── auth.py          # /api/v1/auth (signup, login, me)
│   │       ├── health.py        # /api/v1/health (probes Postgres & Neo4j)
│   │       └── router.py        # V1 router aggregation
│   ├── core/
│   │   └── security.py          # Password hashing & JWT logic
│   ├── db/
│   │   ├── postgres.py          # SQLAlchemy async session & table init
│   │   └── neo4j.py             # Neo4j async driver wrapper & probe
│   ├── models/
│   │   └── user.py              # PostgreSQL User model
│   ├── schemas/
│   │   ├── user.py              # User Pydantic schemas
│   │   ├── token.py             # JWT & token schemas
│   │   └── health.py            # Health probe schemas
│   ├── config.py                # Environment configuration
│   └── main.py                  # FastAPI entrypoint & lifespan
├── .env.example                 # Sample environment template
├── .env                         # Active configuration
├── .gitignore                   # Backend gitignore
└── requirements.txt             # Pinned Python dependencies
```
