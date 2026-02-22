# Architecture

## 1. Tech Stack
- Frontend: Expo React Native
- Backend: Node.js + TS.
- DB: PostgreSQL (Supabase) with PostGIS for geo.
- Storage: S3/Supabase Storage for images.
- Maps: Google Maps redirect.

## 2. High-Level Diagram
Client (Admin + User) → API Gateway → Backend (Auth, Properties, Messages) → Postgres

↘ Storage (images)


## 3. Core Data Models
- Property: id, title, price, coords, status, etc.
- User: id, role, email, password_hash.
- Message: id, user_id, property_id, content.
- Interested: user_id, property_id.

## 4. Key Decisions
- Why this auth method.
- Why this hosting choice.
