# Immigration Management System for International Students (IMS-IS)

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/frontend-React%20%2B%20TypeScript-61DAFB)
![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E)
![Blockchain](https://img.shields.io/badge/integrity-Blockchain%20Hashing-orange)
![ML](https://img.shields.io/badge/analytics-Machine%20Learning-purple)
![Security](https://img.shields.io/badge/security-RLS%20%2B%20JWT-red)
![Status](https://img.shields.io/badge/status-Thesis%20Prototype-informational)

A secure, blockchain-backed and machine learning–ready platform for registration, verification, and visa lifecycle management of international students in Kazakhstan.

---

## 🎓 Thesis Context

Final Year Research Project:

> **“Designing the System for Immigration Management in Kazakhstan Using Blockchain Technologies and Machine Learning Algorithms”**

---

## 🚀 Key Features

- **Digital Student Identity:** QR-based student card + tamper-evident record hashing  
- **Visa Lifecycle Management:** track visa status, expiry, renewals (prototype)  
- **Institution Portal:** universities register/manage students  
- **Verification Portal:** police/authorized verifiers scan QR for real-time validation  
- **ML-Ready:** designed for future risk & expiry prediction models  

---

## 🏗️ System Architecture

```mermaid
flowchart TD
  A[International Student] --> B[React Web App]
  C[Immigration Authority] --> B
  D[Authorized Verifier] --> E[QR Verification Interface]

  B --> F[Supabase Backend]
  E --> G[Verification API]

  F --> H[PostgreSQL Database]
  H --> I[Students Table]
  H --> J[Visas Table]
  H --> K[Student Cards]
  H --> L[Audit Logs]

  G --> N[Blockchain Integrity Ledger]



  Got you — your README currently includes a big **unnecessary duplicated chunk** (the part where it says “Here’s a cleaned-up…” and then re-pastes the whole README inside the README). Also the Mermaid block must be **closed** before any text continues.

Here’s a **short, important, clean README** you can use (keeps only what matters for GitHub + thesis prototype).

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

A secure, blockchain-backed and machine learning–ready platform for registration, verification, and visa lifecycle management of international students in Kazakhstan.

---

## 🎓 Thesis Context

Final Year Research Project:

> **“Designing the System for Immigration Management in Kazakhstan Using Blockchain Technologies and Machine Learning Algorithms”**

---

## 🚀 Key Features

- **Digital Student Identity:** QR-based student card + tamper-evident record hashing  
- **Visa Lifecycle Management:** track visa status, expiry, renewals (prototype)  
- **Institution Portal:** universities register/manage students  
- **Verification Portal:** police/authorized verifiers scan QR for real-time validation  
- **ML-Ready:** designed for future risk & expiry prediction models  

---

## 🏗️ System Architecture

```mermaid
flowchart TD
  A[Student / Institution] -->|Web| B[React Frontend]
  C[Immigration Authority] -->|Admin| B
  D[Verifier / Police] -->|QR Scan| E[Verification Interface]

  B -->|API| F[Supabase Backend]
  E -->|Verify Token| G[Verification API]

  F --> H[(PostgreSQL)]
  H --> I[students]
  H --> J[visas]
  H --> K[student_cards]
  H --> L[audit_logs]
  H --> M[verification_requests]

  G --> N[Blockchain Hash Ledger (Simulated)]
````

---

## 🛠️ Tech Stack

* **Frontend:** React + TypeScript + Vite + MUI
* **Backend:** Supabase (PostgreSQL + Auth + RLS + Edge Functions)
* **Integrity Layer:** Blockchain hashing (prototype / simulated)
* **Analytics:** ML module (planned)

---

## 👥 Roles

| Role                  | Permissions                       |
| --------------------- | --------------------------------- |
| Immigration Authority | full oversight, audits, approvals |
| Institution           | register/manage students          |
| Authorized Verifier   | QR verification (read-only)       |
| Student               | view digital ID + visa status     |

---

## ⚙️ Setup

```bash
git clone https://github.com/your-username/ims-is.git
cd ims-is
npm install
```

Create `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run:

```bash
npm run dev
```

---

## ⚠️ Disclaimer

This is an academic prototype. External integrations and real blockchain deployment are simulated.

---

## 📜 License

MIT

