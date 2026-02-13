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

