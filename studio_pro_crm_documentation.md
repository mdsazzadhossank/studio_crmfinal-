# Studio Pro CRM — Complete System Documentation

## Table of Contents
1. [System Overview](#section-1--system-overview)
2. [Feature Documentation](#section-2--feature-documentation)
3. [Database Documentation](#section-3--database-documentation)
4. [API Documentation](#section-4--api-documentation)
5. [Authentication & Permissions](#section-5--authentication--permissions)
6. [Financial Logic](#section-6--financial-logic)
7. [Workflow & Data Flow](#section-7--workflow--data-flow)
8. [File Structure](#section-8--file-structure)
9. [Security & Validation](#section-9--security--validation)
10. [Known Issues & Improvements](#section-10--known-issues--improvements)

---

## SECTION 1 — SYSTEM OVERVIEW

**Studio Pro CRM** is a full-stack Customer Relationship Management and Agency Management platform built to handle clients, projects, finances, marketing ads, and internal operations for a creative agency.

### Core Architecture
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Recharts (for charts), Lucide React (icons).
- **Backend**: PHP 8+, custom API router.
- **Database**: MySQL 5.7+ / MariaDB 10.3+.
- **State Management paradigm**: The application utilizes a unique "Offline-First / LocalStorage Sync" paradigm. 

**How it works:**
When the app loads (`src/main.tsx`), it pulls all data from the database (`GET /api/sync`) and populates the browser's `localStorage`. The application's `localStorage.setItem` and `removeItem` are **monkey-patched** to fire-and-forget POST/DELETE requests to the backend (`/api/store/{key}`). This ensures that React components can rely on fast, synchronous localStorage reads/writes, while the PHP backend persists the state universally in MySQL (via native tables or the universal `kv_store` table).

---

## SECTION 2 — FEATURE DOCUMENTATION

### 1. Big Fish (VIP Clients)
- **Purpose**: Manage high-tier clients, track ad performance, and handle wallet balances.
- **Components**: `BigFishClientsView.tsx`, `SuperAdminClientDetails.tsx`.
- **Logic**: Clients can be promoted from the general pool to the VIP "Big Fish" pool. Admins adjust wallet balances (top-ups) and record ad performance.

### 2. Agency Profit & Dashboard
- **Purpose**: Global financial tracking of company health, gross profit, and net profit.
- **Components**: `AgencyProfitView.tsx`, `SuperAdminDashboardView.tsx`.
- **Logic**: Aggregates manual profit injections, auto-synced ad profits from the Big Fish module, office expenses, and employee payroll to calculate **Net Profit** in real-time.

### 3. Client Portal
- **Purpose**: A dedicated view for VIP clients to request top-ups, view their wallet ledger, and submit payment proofs.
- **Components**: `VipClientPortal.tsx`.
- **Logic**: Clients upload transaction proofs (saved via `/api/upload_topup_proof.php`) and submit top-up requests. Admins approve these in `SuperAdminClientDetails.tsx`.

### 4. Employee & Payroll Management
- **Purpose**: Manage staff, attendance, and salaries.
- **Components**: `EmployeeList.tsx`, `EmployeeSalaryView.tsx`, `TimeTracking.tsx`, `WorkLog.tsx`.
- **Logic**: Base salaries are aggregated directly into the global Dashboard's expense calculations.

### 5. CRM & Lead Management
- **Purpose**: Track prospective clients, schedule meetings, and convert them to active projects.
- **Components**: `LeadManagement.tsx`, `Clients.tsx`, `ProjectList.tsx`.

---

## SECTION 3 — DATABASE DOCUMENTATION

The MySQL database heavily utilizes standard relational tables alongside a universal JSON fallback table.

### Relational Tables
- **`users`**: Auth system (`id`, `name`, `email`, `password`, `role`, `is_super_admin`, `permissions` JSON).
- **`clients`**: Studio clients (`id`, `name`, `company`, `total_budget`).
- **`projects`**: Belongs to clients (`id`, `client_id`, `status`, `budget`).
- **`models`**: Talent/models database (`hourly_rate`, `portfolio_links`).
- **`invoices` & `invoice_items`**: Billing system.
- **`employees`**: Staff management (`status`, `salary`).
- **`leads`**: Prospect tracking.
- **`schedule_events`**: Calendar system.
- **`tasks`, `work_logs`, `time_logs`**: Internal operations.

### Universal Key-Value Store
- **`kv_store` (`store_key`, `store_value`, `updated_at`)**: 
  This table mirrors the `localStorage` state for complex React arrays that aren't mapped to relational tables (e.g., `vipClientsData`, `sa_profit_injections`, `sa_office_expenses`).

**Data Flow:**
React updates `localStorage.setItem('vipClientsData', [...])` ➔ Monkey-patch intercepts ➔ POSTs to `/api/store/vipClientsData` ➔ PHP saves JSON to `kv_store` table.

---

## SECTION 4 — API DOCUMENTATION

The backend relies on a central router (`backend/api/index.php`).

### Universal Sync API
- **`GET /api/sync`**: Returns a JSON object combining data from all MySQL relational tables and the `kv_store`.
- **`GET /api/store/{key}`**: Fetches a specific key.
- **`POST /api/store/{key}`**: Inserts/Updates a key in the `kv_store`.
- **`DELETE /api/store/{key}`**: Removes a key from the `kv_store`.

### Relational CRUD APIs (Examples)
- **`/api/add_client.php` (POST)**: Creates a new client in the `clients` table.
- **`/api/get_projects.php` (GET)**: Fetches `projects` joined with `clients`.
- **`/api/upload_topup_proof.php` (POST)**: Handles multipart form data, validates MIME types, saves images to `backend/uploads/topup-proofs/Y/M/`, and returns the URL.

### Authentication
- **`/api/auth/login` (POST)**: Validates credentials, sets secure HttpOnly session cookies.
- **`/api/auth/check` (GET)**: Verifies active session.

---

## SECTION 5 — AUTHENTICATION & PERMISSIONS

- **Session Handling**: Uses native PHP sessions (`session_start()`). Cookies are configured as `HttpOnly` and `SameSite=Lax`.
- **Password Security**: Uses PHP's `password_hash()` (bcrypt algorithms).
- **Roles**: Defined in the `users` table (`admin`, `manager`, `user`).
- **Super Admin Flag**: The `is_super_admin` boolean unlocks the "Super Admin Headquarters" module.
- **Granular Permissions**: The `permissions` JSON column allows toggling specific modules per user (e.g., "dashboard", "projects", "invoice").

---

## SECTION 6 — FINANCIAL LOGIC

The system follows a strict centralized synchronization flow to ensure dashboard accuracy.

### 1. Wallet Top-Up
Client submits proof ➔ Admin approves ➔ `client.balance` increases ➔ `client.ledger` updated.

### 2. Ad Performance & Profit Generation
Admin logs ad performance (`clientBill` vs `actualCost`):
- `adWalletEffect` = `clientBill * chargeRate` (deducted from Wallet)
- `adAgencyCost` = `actualCost * buyRate`
- **`adProfit` = `adWalletEffect - adAgencyCost`**

### 3. Centralized Profit Sync Engine (Crucial)
When an Ad Record is saved, updated, or deleted in `SuperAdminClientDetails.tsx`:
1. The client's local `adHistory` is updated.
2. A helper function (`syncProfitInjection`, `updateProfitInjection`, `deleteProfitInjection`) automatically pushes the profit amount directly into the `sa_profit_injections` key as `autoGenerated: true`.

### 4. Dashboard Aggregation
The `AgencyProfitView` and `SuperAdminDashboardView` calculate:
- **Gross Profit**: `SUM(sa_profit_injections.amount)`
- **Total Expenses**: `SUM(sa_office_expenses.amount) + SUM(sa_employees.baseSalary)`
- **Net Profit**: `Gross Profit - Total Expenses`

Because of the auto-sync engine, Ad Profits appear globally in real-time without double-counting.

---

## SECTION 7 — WORKFLOW & DATA FLOW

### Top-Up Request Workflow
1. **Client Action**: VIP client accesses Client Portal, inputs amount, uploads screenshot. React uploads image to `/api/upload_topup_proof.php`. 
2. **Data Storage**: Request appended to `client.topUpRequests` and synced to `kv_store`.
3. **Admin Action**: Admin navigates to Super Admin Headquarters -> Big Fish -> Client Profile -> Top-Up Tab. Admin views proof image via Lightbox.
4. **Approval**: Admin clicks "Approve". Balance increments. Ledger updates. Top-up status changes to `approved`.

### Data Synchronization Flow
```text
[User clicks Save]
       ↓
[React State Updates]
       ↓
[localStorage.setItem() invoked]
       ↓
[Monkey-patch POSTs JSON payload to /api/store/{key}]
       ↓
[StoreController.php upserts JSON into `kv_store` MySQL table]
```

---

## SECTION 8 — FILE STRUCTURE

```text
├── backend/
│   ├── api/
│   │   └── index.php           # Central API Router
│   ├── config/
│   │   └── database.php        # PDO DB connection
│   ├── controllers/            # PHP Business logic (Client, Project, Store)
│   ├── database/
│   │   └── schema.sql          # DB Structure
│   ├── helpers/
│   ├── middleware/             # Auth & CORS protection
│   └── uploads/                # User uploaded media
├── deploy_to_hosting/          # Staging dir for production push
└── src/
    ├── components/
    │   ├── super-admin/        # Financial & VIP logic (BigFish, AgencyProfit)
    │   └── ...                 # Standard CRM views (Projects, Invoices)
    ├── App.tsx                 # Routing
    └── main.tsx                # Entry point & LocalStorage Sync Engine
```

---

## SECTION 9 — SECURITY & VALIDATION

1. **Upload Security**: `/api/upload_topup_proof.php` restricts file MIME types (`image/jpeg`, `image/png`, `image/webp`) and sizes (Max 5MB). Filenames are sanitized and unique hashes are added to prevent execution exploits.
2. **SQL Injection Prevention**: All PHP database queries utilize PDO Prepared Statements with parameterized inputs (`:id`, `:name`).
3. **XSS Protection**: Handled inherently by React's JSX DOM escaping.
4. **API Protection**: `middleware/auth.php` validates active PHP sessions before allowing destructive API actions. CORS is strictly defined.

---

## SECTION 10 — KNOWN ISSUES & IMPROVEMENTS

### 1. State Management Scalability
- **Issue**: Relying on `localStorage` strings combined with JSON arrays in `kv_store` works well for smaller datasets but will experience performance bottlenecks and race conditions if multiple users edit the same array (e.g., `vipClientsData`) simultaneously.
- **Improvement**: Migrate `vipClientsData` fully to native SQL tables (`vip_clients`, `ad_history`, `ledger_transactions`) and utilize RESTful CRUD endpoints instead of monolithic JSON string overwriting.

### 2. LocalStorage Size Limits
- **Issue**: Browsers enforce a ~5MB limit on `localStorage`. As `vipClientsData` and `sa_profit_injections` grow, the app will crash upon hitting this limit.
- **Improvement**: Move heavy historical data (ledgers, ad history) out of local state. Fetch them dynamically via API pagination only when rendering the Client Details page.

### 3. Financial Transaction Integrity
- **Issue**: Currently, if a network error occurs during the Monkey-patch POST request, the local UI reflects the financial change, but the backend does not.
- **Improvement**: Implement optimistic UI updates with rollback capabilities. Use formal ACID-compliant MySQL database transactions (`BEGIN`, `COMMIT`, `ROLLBACK`) for wallet deductions and profit generation.
