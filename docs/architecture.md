# Technical Architecture - Navi

This document details the system design, data flow, and planned integrations for **Navi**.

---

## 1. Architecture Overview

Navi is structured as a monorepo, uniting the mobile application (React Native/Expo), the administrative web dashboard (React/Vite), the core REST API (Ruby on Rails), and shared TypeScript packages.

```mermaid
graph TD
    subgraph Client Apps
        A[Mobile App - Expo] -->|HTTPS / JSON| C(Rails API)
        B[Web Dashboard - Vite] -->|HTTPS / JSON| C
    end

    subgraph Backend Services
        C -->|Active Record| D[(Neon Serverless PostgreSQL)]
        C -->|Gemini API SDK| E[Google Gemini AI]
    end

    subgraph Shared Node Packages
        F[@navi/types] -.-> A
        F -.-> B
        G[@navi/shared] -.-> A
        G -.-> B
    end
```

---

## 2. Artificial Intelligence Strategy

Navi's AI will serve as the primary entry point for creating and managing records of finances, habits, goals, and projects.

### Conversational Flow (Natural Language)
1. **Send**: The user sends a natural language sentence in the chat (e.g. *"I just spent $30 on transport"*).
2. **Processing**: The Rails API receives the message and forwards it to the **Gemini API**, structuring the response with **Structured Outputs** (JSON).
3. **Action Mapping**:
   - The AI identifies the intent as `CREATE_TRANSACTION`.
   - It extracts entities: `amount: 3000` (in cents), `description: "transport"`, `category: "Transport"`.
4. **Execution**: Rails validates the transaction, persists it in the Neon PostgreSQL database, and returns a structured JSON confirmation to the application.
5. **UI**: The app dynamically renders the confirmation and updates local charts.

---

## 3. Database (Neon Serverless PostgreSQL)

Choosing **Neon** allows serverless scalability with excellent latency and support for git-like database branching.

### Initial Database Schema Design

```mermaid
erDiagram
    USERS ||--o{ TRANSACTIONS : "has"
    USERS ||--o{ GOALS : "establishes"
    USERS ||--o{ HABITS : "cultivates"
    USERS ||--o{ PROJECTS : "manages"
    
    HABITS ||--o{ HABIT_LOGS : "logs"
    PROJECTS ||--o{ TASKS : "contains"
    
    USERS {
        uuid id PK
        string email
        string password_digest
        string name
        datetime created_at
    }

    TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        integer amount_cents
        string transaction_type
        string category
        string description
        date transaction_date
    }

    GOALS {
        uuid id PK
        uuid user_id FK
        string title
        integer target_value
        integer current_value
        string unit
        date deadline
    }

    HABITS {
        uuid id PK
        uuid user_id FK
        string name
        string frequency
        integer current_streak
        integer best_streak
    }

    HABIT_LOGS {
        uuid id PK
        uuid habit_id FK
        datetime completed_at
        string notes
    }
```
