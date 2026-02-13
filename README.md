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
