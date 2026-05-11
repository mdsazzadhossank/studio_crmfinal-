# Studio Pro CRM — PHP Backend

## Quick Start (Local Development)

### Prerequisites
- PHP 8.0+ with extensions: `pdo`, `pdo_mysql`, `json`, `mbstring`
- MySQL 5.7+ or MariaDB 10.3+
- Apache with `mod_rewrite` enabled (or PHP built-in server for testing)

### Step 1: Configure Database
Edit `backend/.env`:
```env
DB_HOST=localhost
DB_NAME=studio_pro_crm
DB_USER=root
DB_PASS=your_password
```

### Step 2: Run Setup
Option A — Browser setup:
```bash
cd backend
php -S localhost:8000
# Visit: http://localhost:8000/setup.php
```

Option B — Import schema manually:
```bash
mysql -u root -p < backend/database/schema.sql
```

### Step 3: Start PHP Server
```bash
cd backend
php -S localhost:8000
```

### Step 4: Update Frontend Config
In `src/config.ts`, set:
```typescript
export const API_BASE_URL = 'http://localhost:8000/api';
export const USE_MOCK_FALLBACK = false;
```

### Step 5: Run Frontend
```bash
npm run dev
```

---

## Production Deployment (cPanel / Shared Hosting)

1. Upload `backend/` folder to your server (e.g., `public_html/backend/`)
2. Edit `.env` with production database credentials
3. Run `setup.php` once via browser, then DELETE it
4. Build React: `npm run build`
5. Upload `dist/` contents to `public_html/`
6. Update `src/config.ts` API_BASE_URL before building

---

## Architecture

```
backend/
├── api/index.php          ← Single entry point router
├── config/
│   ├── config.php         ← Environment loading & constants
│   └── database.php       ← PDO connection singleton
├── controllers/           ← 10 controllers
├── models/                ← 9 data models
├── middleware/
│   ├── auth.php           ← Session-based auth
│   └── cors.php           ← CORS handling
├── helpers/               ← Validation, response, upload
├── database/schema.sql    ← 19 MySQL tables
└── setup.php              ← Auto-installer (delete after use)
```

## Default Admin
- **Email**: `admin`
- **Password**: `admin`

## API Endpoints
See `backend/api/index.php` for the complete route map.
