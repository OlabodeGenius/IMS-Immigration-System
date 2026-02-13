# Immigration Management System for International Students (IMS-IS)

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-61DAFB)
![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E)
![Blockchain](https://img.shields.io/badge/integrity-Blockchain%20Hashing-orange)
![ML](https://img.shields.io/badge/analytics-Machine%20Learning-purple)
![Security](https://img.shields.io/badge/security-RLS%20%2B%20JWT-red)
![Status](https://img.shields.io/badge/status-Thesis%20Prototype-informational)

## 🏗️ System Architecture (Thesis-Level Design)

The Immigration Management System (IMS-IS) follows a multi-layer secure architecture integrating web technologies, blockchain-based integrity verification, and machine learning-ready analytics modules.

```mermaid
flowchart TD
    A[International Student / Institution User] -->|Web Access| B[React Frontend (Vite + MUI)]
    C[Immigration Authority] -->|Admin Access| B
    D[Authorized Verifier / Police] -->|QR Scan| E[Verification Interface]

    B -->|API Calls| F[Supabase Backend]
    E -->|Verify QR Token| G[Verification API (Edge Function)]

    F --> H[(PostgreSQL Database)]
    H --> I[Students Table]
    H --> J[Visas Table]
    H --> K[Student Cards Table]
    H --> L[Audit Logs]
    H --> M[Verification Requests]

    G --> H
    G --> N[Blockchain Hash Ledger (Simulated)]

    F --> O[Auth Service (JWT + RBAC)]
    O --> P[Row Level Security Policies]

    F --> Q[ML Analytics Module (Future)]
    Q --> R[Prediction Engine - Visa Expiry & Risk Detection]

    
---

## 🧾 Academic Description (for Thesis + README)
Add below the diagram:

```md
### Architectural Overview
The system adopts a centralized yet modular architecture where the React-based frontend communicates securely with a Supabase backend implementing PostgreSQL, Authentication, and Row-Level Security (RLS). 

A blockchain-integrity layer (simulated ledger) stores hashed student identity records to ensure tamper-evident verification, while a QR-based verification interface allows authorized entities such as immigration officers and police to validate student legitimacy in real-time. 

The architecture is designed to be extensible for machine learning integration, enabling predictive analytics for visa expiry monitoring and fraud detection in future deployments.


## 🔌 API Documentation

The IMS-IS platform exposes secure backend endpoints (via Supabase Edge Functions and REST interfaces) for identity verification, student management, and visa lifecycle processing.

All endpoints follow a secure JWT-based authentication model with Role-Based Access Control (RBAC).

---

### 🔐 Authentication
Authentication is handled using Supabase Auth (JWT).

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/v1/token | User login via email/password |
| GET | /auth/v1/user | Fetch authenticated user session |

---

## 🪪 Student Management API

### 1. Register Student
**Endpoint:**  



**Description:**  
Registers a new international student and creates associated visa records.

**Request Body:**
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

# Immigration Management System for International Students (IMS-IS)

A secure, blockchain-backed and machine learning–enhanced immigration management platform designed to modernize the registration, verification, and visa lifecycle management of international students in Kazakhstan.

This project is developed as a full-stack academic and functional prototype, integrating Web Technologies, Supabase Backend, Role-Based Access Control (RLS), and QR-based Digital Identity Verification to address inefficiencies in traditional immigration workflows.

---

## 🎓 Thesis Context

This system is part of a Final Year Research Project titled:

> **“Designing the System for Immigration Management in Kazakhstan Using Blockchain Technologies and Machine Learning Algorithms”**

The platform focuses specifically on international students, aiming to solve real-world issues such as:

* Repetitive biometric registrations
* Manual visa renewals
* Physical passport dependency for verification
* Fragmented data between universities and immigration authorities
* Lack of tamper-proof identity validation

---

## 🚀 Key Features

### 🔐 Digital Student Identity System

* Blockchain-hashed student ID records
* Physical Digital ID Card with embedded QR verification
* Tamper-evident identity validation

### 🛂 Immigration & Visa Management

* Student visa lifecycle tracking (C3 Category)
* Visa renewal monitoring & notifications
* Secure immigration database integration (simulated)

### 🏫 Institutional Integration

* Universities register and manage international students
* Attendance and compliance monitoring
* Institutional dashboard analytics

### 📱 QR-Based Verification Mechanism

* QR Code embedded with signed verification token
* Real-time validation via backend API
* Minimal privacy exposure (GDPR-aware)

### 🤖 Smart Analytics (ML-Ready Architecture)

* Visa expiry prediction (simulated dataset)
* Fraud detection architecture (extensible)
* Compliance risk analytics module

---

## 🧱 System Architecture

```
Frontend (React + MUI)
        │
        ▼
Supabase (Auth + PostgreSQL + RLS + Edge Functions)
        │
        ├── Blockchain Hash Layer (Simulated Ledger)
        ├── Verification API (QR Scan Endpoint)
        └── Audit & Verification Logs
```

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
* Row-Level Security (Government-grade access control)

### Security & Integrity

* Blockchain Hash Storage (Record Integrity)
* JWT-based Authentication
* Role-Based Access Control (IMMIGRATION / INSTITUTION)

### Mobile (Planned Extension)

* Android (Kotlin/React Native compatible architecture)

---

## 👥 User Roles

| Role                            | Permissions                                            |
| ------------------------------- | ------------------------------------------------------ |
| Immigration Authority           | Full system control, verification logs, visa oversight |
| Institution (University/School) | Register students, manage visas, monitor compliance    |
| Authorized Verifier (Police)    | QR-based student legitimacy verification (read-only)   |
| International Student           | Digital ID holder & visa lifecycle tracking            |

---

## 🔎 QR Verification Workflow

1. Physical Digital ID Card contains QR Code
2. QR encodes a signed, time-bound verification URL
3. Verifier scans QR (Police/Authority)
4. Backend validates:

   * Token authenticity
   * Card status
   * Visa validity
   * Blockchain record hash
5. System returns minimal verification data:

   * Validity Status
   * Institution Name
   * Visa Status & Expiry

---

## 🔐 Database Security (RLS Enabled)

This system implements PostgreSQL Row-Level Security to enforce strict data governance:

* Immigration: Full read/write access
* Institutions: Access only to their registered students
* Verification Logs: Restricted to Immigration Authority
* Audit Logs: Immutable tracking of system actions

---

## 📂 Project Structure

```
ims-web/
├── src/
│   ├── auth/            # Authentication & Protected Routes
│   ├── components/      # Reusable UI Components
│   ├── hooks/           # Data fetching & business logic hooks
│   ├── pages/           # Main system pages (Dashboard, Landing, Login)
│   ├── profile/         # Role & profile management
│   ├── lib/             # Supabase client & utilities
│   ├── types/           # Database and DTO types
│   └── router/          # Application routing
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/ims-is.git
cd ims-is
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4️⃣ Run Development Server

```bash
npm run dev
```

---

## 🗄️ Supabase Configuration (Required)

* Enable Authentication (Email/Password)
* Disable Email Confirmation (for prototype testing)
* Execute SQL Schema (Tables + RLS Policies)
* Create Profiles for Roles (IMMIGRATION / INSTITUTION)

---

## 📊 Evaluation & Testing

The system was evaluated using a controlled experimental dataset simulating:

* Student registrations
* Visa lifecycle events
* QR verification requests
* Fraud and expiry scenarios

Performance Metrics:

* Verification Response Time
* Data Integrity Accuracy
* Role-Based Access Enforcement
* System Scalability (Concurrent Requests)

---

## 🔬 Research Contribution (Scientific Novelty)

* Blockchain-integrated digital immigration identity model
* ML-ready predictive visa analytics framework
* QR-based tamper-evident verification architecture
* Centralized multi-stakeholder immigration platform for Kazakhstan

---

## ⚠️ Disclaimer

This project is a functional academic prototype developed for research and educational purposes. External integrations (banking systems, national immigration databases, blockchain networks) are simulated.

---

## 📜 License

MIT License – For academic and research use.

---

## 👨‍💻 Authors

Final Year Thesis Project Team
Focus Area: Blockchain, Machine Learning, and E-Government Systems
Kazakhstan (International Student Immigration Context)
