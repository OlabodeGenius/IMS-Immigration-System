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
