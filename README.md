# Immigration Management System for International Students (IMS-IS)

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-61DAFB)
![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E)
![Blockchain](https://img.shields.io/badge/integrity-Blockchain%20Hashing-orange)
![ML](https://img.shields.io/badge/analytics-Machine%20Learning-purple)
![Security](https://img.shields.io/badge/security-RLS%20%2B%20JWT-red)
![Status](https://img.shields.io/badge/status-Thesis%20Prototype-informational)

A secure, blockchain-backed and machine learning–ready immigration management platform designed to modernize the registration, verification, and visa lifecycle management of international students in Kazakhstan.

This project is developed as an academic full-stack prototype using Web Technologies, Supabase Backend, Role-Based Access Control (RLS), and QR-based Digital Identity Verification to address inefficiencies in traditional immigration workflows.

---

## 🎓 Thesis Context

This system is part of a Final Year Research Project titled:

> **“Designing the System for Immigration Management in Kazakhstan Using Blockchain Technologies and Machine Learning Algorithms”**

The platform focuses on international students and targets real-world issues such as:

- Manual visa renewals and fragmented data between institutions and immigration authorities  
- Physical document dependency for identity verification  
- Weak auditability and lack of tamper-evident identity validation  
- Repetitive identity checks and slow verification workflows  

---

## 🚀 Key Features

### 🔐 Digital Student Identity
- Student identity records hashed for tamper-evidence (blockchain ledger / simulated layer)
- Physical/Digital ID card with embedded QR verification
- Minimal-data verification responses (privacy-aware)

### 🛂 Immigration & Visa Management
- Student visa lifecycle tracking (e.g., C3 category)
- Renewal monitoring & expiry notifications (prototype-ready)
- Secure database integration (simulated where necessary)

### 🏫 Institutional Integration
- Universities register and manage international students
- Compliance monitoring and reporting (prototype)
- Institutional dashboard views

### 📱 QR-Based Verification
- QR code encodes a signed, time-bound verification token
- Real-time validation via backend API (Edge Function / API route)
- Blockchain hash check for integrity validation

### 🤖 Analytics (ML-Ready)
- Extensible design for visa expiry prediction and risk detection
- Architecture supports future integration with ML scoring pipelines

---

## 🏗️ System Architecture

### High-Level Overview
The system adopts a centralized yet modular architecture where the React-based frontend communicates securely with a Supabase backend implementing PostgreSQL, Authentication, and Row-Level Security (RLS).

A blockchain-integrity layer stores hashed student identity records to enable tamper-evident verification. A QR-based verification interface allows authorized entities (e.g., immigration officers and police) to validate student legitimacy in real-time.

The architecture is designed to be extensible for machine learning integration, enabling predictive analytics for visa expiry monitoring and fraud detection in future deployments.

```mermaid
flowchart TD
  A[International Student / Institution User] -->|Web Access| B[React Frontend (Vite + MUI)]
  C[Immigration Authority] -->|Admin Access| B
  D[Authorized Verifier / Police] -->|QR Scan| E[Verification Interface]

  B -->|API Calls| F[Supabase Backend]
  E -->|Verify QR Token| G[Verification API (Edge Function / API Route)]

  F --> H[(PostgreSQL Database)]
  H --> I[students]
  H --> J[visas]
  H --> K[student_cards]
  H --> L[audit_logs]
  H --> M[verification_requests]

  G --> H
  G --> N[Blockchain Hash Ledger (Simulated)]

  F --> O[Auth Service (JWT)]
  O --> P[Row-Level Security Policies (RLS)]

  F --> Q[ML Analytics Module (Future)]
  Q --> R[Prediction Engine: Expiry & Risk Detection]


Here’s a cleaned-up, consistent, properly structured README. I fixed:

* Broken Mermaid block (it wasn’t closed)
* Duplicate content + repeated title
* Mixed formatting (markdown fences, headings)
* Incomplete API section (added endpoints + example paths)
* Clear “what’s real vs simulated”
* More thesis-ready wording without sounding messy
* Removed the “Add below the diagram:” instruction and embedded it properly

You can paste this as your new `README.md`:

````md
# Immigration Management System for International Students (IMS-IS)

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-61DAFB)
![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E)
![Blockchain](https://img.shields.io/badge/integrity-Blockchain%20Hashing-orange)
![ML](https://img.shields.io/badge/analytics-Machine%20Learning-purple)
![Security](https://img.shields.io/badge/security-RLS%20%2B%20JWT-red)
![Status](https://img.shields.io/badge/status-Thesis%20Prototype-informational)

A secure, blockchain-backed and machine learning–ready immigration management platform designed to modernize the registration, verification, and visa lifecycle management of international students in Kazakhstan.

This project is developed as an academic full-stack prototype using Web Technologies, Supabase Backend, Role-Based Access Control (RLS), and QR-based Digital Identity Verification to address inefficiencies in traditional immigration workflows.

---

## 🎓 Thesis Context

This system is part of a Final Year Research Project titled:

> **“Designing the System for Immigration Management in Kazakhstan Using Blockchain Technologies and Machine Learning Algorithms”**

The platform focuses on international students and targets real-world issues such as:

- Manual visa renewals and fragmented data between institutions and immigration authorities  
- Physical document dependency for identity verification  
- Weak auditability and lack of tamper-evident identity validation  
- Repetitive identity checks and slow verification workflows  

---

## 🚀 Key Features

### 🔐 Digital Student Identity
- Student identity records hashed for tamper-evidence (blockchain ledger / simulated layer)
- Physical/Digital ID card with embedded QR verification
- Minimal-data verification responses (privacy-aware)

### 🛂 Immigration & Visa Management
- Student visa lifecycle tracking (e.g., C3 category)
- Renewal monitoring & expiry notifications (prototype-ready)
- Secure database integration (simulated where necessary)

### 🏫 Institutional Integration
- Universities register and manage international students
- Compliance monitoring and reporting (prototype)
- Institutional dashboard views

### 📱 QR-Based Verification
- QR code encodes a signed, time-bound verification token
- Real-time validation via backend API (Edge Function / API route)
- Blockchain hash check for integrity validation

### 🤖 Analytics (ML-Ready)
- Extensible design for visa expiry prediction and risk detection
- Architecture supports future integration with ML scoring pipelines

---

## 🏗️ System Architecture

### High-Level Overview
The system adopts a centralized yet modular architecture where the React-based frontend communicates securely with a Supabase backend implementing PostgreSQL, Authentication, and Row-Level Security (RLS).

A blockchain-integrity layer stores hashed student identity records to enable tamper-evident verification. A QR-based verification interface allows authorized entities (e.g., immigration officers and police) to validate student legitimacy in real-time.

The architecture is designed to be extensible for machine learning integration, enabling predictive analytics for visa expiry monitoring and fraud detection in future deployments.

```mermaid
flowchart TD
    A[International Student / Institution User] -->|Web Access| B[React Frontend (Vite + MUI)]
    C[Immigration Authority] -->|Admin Access| B
    D[Authorized Verifier / Police] -->|QR Scan| E[Verification Interface]

    B -->|API Calls| F[Supabase Backend]
    E -->|Verify QR Token| G[Verification API (Edge Function / API Route)]

    F --> H[(PostgreSQL Database)]
    H --> I[students]
    H --> J[visas]
    H --> K[student_cards]
    H --> L[audit_logs]
    H --> M[verification_requests]

    G --> H
    G --> N[Blockchain Hash Ledger (Simulated)]

    F --> O[Auth Service (JWT)]
    O --> P[Row-Level Security Policies (RLS)]

    F --> Q[ML Analytics Module (Future)]
    Q --> R[Prediction Engine: Expiry & Risk Detection]
````

---

## 🛠️ Technology Stack

### Frontend

* React + TypeScript
* Vite
* Material UI (MUI)
* React Hook Form + Zod (Validation)
* TanStack Query (Server State)

### Backend

* Supabase (PostgreSQL + Auth + RLS)
* Supabase Edge Functions (Verification API)
* Storage for document uploads (optional)

### Security & Integrity

* JWT Authentication
* Role-Based Access via Supabase RLS
* Blockchain-based hashing (prototype / simulated ledger)

### Mobile (Planned)

* React Native (Expo) compatible architecture (planned)

---

## 👥 User Roles

| Role                            | Permissions                                                         |
| ------------------------------- | ------------------------------------------------------------------- |
| Immigration Authority           | Full system control, audits, visa oversight, approvals              |
| Institution (University/School) | Register/manage students, manage visa records for their institution |
| Authorized Verifier (Police)    | QR verification (read-only, minimal info)                           |
| International Student           | Digital ID holder, view status + visa lifecycle                     |

> **Note:** Roles are enforced using Supabase Auth + RLS policies.

---

## 🔎 QR Verification Workflow

1. Student card contains a QR Code
2. QR encodes a signed, time-bound verification token (or URL containing token)
3. Verifier scans QR (Police/Authority)
4. Backend validates:

   * Token authenticity and expiry
   * Card status
   * Visa validity and expiry
   * Blockchain hash integrity (tamper-evidence)
5. System returns minimal verification data:

   * Valid/Invalid
   * Institution name
   * Visa status + expiry date

---

## 🔌 API Documentation (Prototype)

The platform exposes secure backend endpoints (Supabase REST + Edge Functions / API routes) for identity verification, student management, and visa lifecycle operations.

All protected endpoints use **JWT authentication** and **RBAC enforced by RLS**.

### 🔐 Authentication (Supabase)

| Method | Endpoint         | Description                |
| ------ | ---------------- | -------------------------- |
| POST   | `/auth/v1/token` | Login via email/password   |
| GET    | `/auth/v1/user`  | Fetch current user session |

### 🪪 Student Management (example routes)

These routes can be implemented as Edge Functions or backend API routes:

| Method | Endpoint            | Role                    | Description                                |
| ------ | ------------------- | ----------------------- | ------------------------------------------ |
| POST   | `/api/students`     | Institution             | Register a student and create related visa |
| GET    | `/api/students/:id` | Institution/Immigration | Fetch student record                       |
| PATCH  | `/api/students/:id` | Institution/Immigration | Update student record                      |
| POST   | `/api/visas`        | Institution/Immigration | Create visa record                         |
| PATCH  | `/api/visas/:id`    | Immigration             | Approve/update visa status                 |
| POST   | `/api/verify`       | Verifier/Immigration    | Verify QR token + return minimal info      |

#### Example: Register Student

**Method:** `POST`
**Endpoint:** `/api/students`

**Request Body**

```json
{
  "student": {
    "full_name": "John Doe",
    "student_id_number": "KBTU-2026-001",
    "citizenship": "Nigeria",
    "date_of_birth": "2002-09-05",
    "passport_number": "A12345678"
  },
  "visa": {
    "visa_type": "C3",
    "start_date": "2026-09-01",
    "end_date": "2030-07-01"
  }
}
```

---

## 🔐 Database Security (RLS Enabled)

This system uses PostgreSQL Row-Level Security to enforce data governance:

* Immigration: full read/write access
* Institutions: access limited to students registered by that institution
* Verification logs: visible only to immigration authority
* Audit logs: append-only tracking of system actions

---

## 📂 Project Structure

```txt
ims-web/
├── src/
│   ├── auth/            # Authentication & protected routes
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Data fetching & business logic hooks
│   ├── pages/           # Main pages (Dashboard, Landing, Login)
│   ├── profile/         # Role & profile management
│   ├── lib/             # Supabase client & utilities
│   ├── types/           # Database and DTO types
│   └── router/          # App routing
```

---

## ⚙️ Installation & Setup

### 1) Clone Repository

```bash
git clone https://github.com/your-username/ims-is.git
cd ims-is
```

### 2) Install Dependencies

```bash
npm install
```

### 3) Configure Environment Variables

Create `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4) Run Development Server

```bash
npm run dev
```

---

## 🗄️ Supabase Configuration (Required)

* Enable Authentication (Email/Password)
* Configure roles in `profiles` table (IMMIGRATION / INSTITUTION / VERIFIER / STUDENT)
* Create tables + RLS policies (SQL schema)
* Configure Storage buckets if document upload is used

---

## 📊 Evaluation & Testing (Prototype)

The prototype can be evaluated using simulated data for:

* Student registrations
* Visa lifecycle events
* QR verification requests
* Fraud and expiry scenarios

Example metrics:

* Verification response time
* Data integrity accuracy (hash match rate)
* Role-based access enforcement
* Scalability under concurrent requests

---

## 🔬 Research Contribution

* Blockchain-integrated digital immigration identity model (hash-based integrity)
* ML-ready predictive visa analytics framework
* QR-based tamper-evident verification architecture
* Centralized multi-stakeholder prototype for Kazakhstan

---

## ⚠️ Disclaimer

This is a functional academic prototype built for research and education. External integrations (national databases, production blockchain networks) are simulated.

---

## 📜 License

MIT License – for academic and research use.

---

## 👨‍💻 Authors

Final Year Thesis Project Team
Focus: Blockchain, Machine Learning, and E-Government Systems
Kazakhstan (International Student Immigration Context)

```

If you want, paste your **actual Edge Function names / routes** (or your repo structure), and I’ll tailor the API table + project structure so it matches your code exactly.
```
