# EventEase: AI-Powered Event Booking & Management System

> **A full-stack, enterprise-ready event planning platform connecting hosts with curated event service providers through a deterministic rule-based recommendation engine, Google Gemini AI assistant, and concurrency-safe booking workflows.**

---

## 1. Project Overview

**EventEase** is built from scratch with a **React (Vite) + Node.js (Express) + MySQL 8.0** technology stack, wrapped in an elegant **Lavender and White** design aesthetic with subtle gradients.

### Core Value Proposition
* **Deterministic Rule-Based Recommendation Engine**: Real-time 100-point multi-criteria scoring algorithm that evaluates vendor compatibility based on category requirements (35%), budget alignment (25%), geographic coverage (15%), date availability (15%), and verified customer ratings (10%). Every match comes with transparent, human-readable explanations.
* **Concurrency-Safe Availability**: ACID transactions ensure vendors are never double-booked on the same event date.
* **AI Event-Planning Assistant**: Integration with the Google Gemini API for bespoke theme concepts, budget breakdowns, and phase-by-phase planning checklists, with a resilient deterministic fallback engine when API keys are not supplied.
* **3 Isolated User Roles**: Customer, Vendor, and Administrator with server-side authorization guards.

---

## 2. Technology Stack

* **Frontend**:
  * React 18
  * Vite
  * React Router v6
  * Axios (with automatic JWT authentication interceptors)
  * Lucide React Icons
  * Bespoke CSS variable-driven Design System (Lavender `#C9B3F5`, Soft Lilac `#E9DDFB`, Pristine Canvas `#FAF8FF`, Deep Purple `#6240A0`)
* **Backend**:
  * Node.js & Express.js (ES Modules)
  * JSON Web Tokens (`jsonwebtoken`)
  * `bcryptjs` password hashing (salt rounds: 10)
  * `mysql2/promise` connection pooling with parameterized SQL
  * `helmet` HTTP security headers & CORS origin control
  * `express-rate-limit` brute-force protection
* **Database**:
  * MySQL 8.0 (InnoDB relational storage, foreign key constraints, composite unique keys, and B-tree indexes)
* **AI Integration**:
  * Google Gemini API (`@google/generative-ai`)
  * Local deterministic algorithmic event planner fallback

---

## 3. The 15 Functional Modules

| Module | Purpose & Capabilities |
| :--- | :--- |
| **1. Authentication & Security** | Customer and Vendor registration with role isolation (Admins cannot self-register). JWT token verification and `bcrypt` password hashing. |
| **2. Customer Dashboard** | Active events overview, nearest event tracker, pending quote alerts, and instant top rule-matched artisan cards. |
| **3. Event Requirements** | Multi-attribute event wizard (type, date/time, location, guests, budget, multi-category service needs, and aesthetics). |
| **4. Vendor Profiles & Catalog** | Public profile with studio bio, city, coverage radius, starting investment, portfolio showcase, and granular service menu. |
| **5. Vendor Search & Filters** | Real-time multi-filter marketplace searching across keywords, categories, price range, city, star ratings, and date availability. |
| **6. Rule-Based AI Rec Engine** | 100-point multi-criteria scoring engine with transparent bulleted justifications and dimensional breakdowns. |
| **7. Booking Management** | End-to-end booking states (`pending`, `accepted`, `rejected`, `cancelled`, `completed`) with atomic concurrency locks. |
| **8. Messaging & Chat** | Context-bound conversations linked to bookings/events with message histories and unread alerts. |
| **9. AI Planning Assistant** | Google Gemini integration creating custom themes, budget allocations, and interactive milestone checklists. |
| **10. Notifications & Activity** | In-app notification bell with unread counters, click-to-navigate links, and real-time polling. |
| **11. Administrator Console** | Platform analytics, user directory with suspension toggles, vendor verification moderation, and system activity logs. |
| **12. Reviews & Ratings** | Gated reviews restricted to completed bookings with `UNIQUE(booking_id)` constraint and rolling average recalculation. |
| **13. Availability Calendar** | Vendor blackout date manager and automatic date locking upon booking acceptance. |
| **14. Application Security** | Parameterized queries, role guards (`requireRole`), rate limiting, and zero credential exposure. |
| **15. Premium Responsive UI** | Responsive layout across desktop, tablet, and mobile with soft lavender cards, frosted glass headers, and badges. |

---

## 4. Database Architecture & Seed Data

The relational schema encompasses 16 tables:
* `users`
* `customer_profiles`
* `vendor_profiles`
* `service_categories`
* `vendor_services`
* `vendor_portfolio`
* `vendor_availability`
* `events`
* `event_requirements`
* `bookings`
* `booking_status_history`
* `reviews`
* `conversations`
* `messages`
* `notifications`
* `activity_logs`

### Default Pre-Configured Test Accounts

| Role | Email Address | Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@eventease.com` | `password123` | Platform Oversight, User Moderation, Verification Queue |
| **Customer** | `customer@eventease.com` | `password123` | Event Creation, AI Recommendations, Booking Inquiries, Reviews |
| **Vendor** | `vendor.lavish@eventease.com` | `password123` | Catering Studio, Request Acceptance, Quote Submission |
| **Vendor** | `vendor.lumiere@eventease.com` | `password123` | Photography Studio, Calendar Management, Completed Bookings |

*(Quick demo buttons are also embedded directly on the Login page for immediate one-click testing.)*

---

## 5. Local Setup & Running Instructions

### Prerequisites
* **Node.js** v18+ (tested on v24.14.0)
* **npm** v9+ (tested on v11.9.0)
* **MySQL** 8.0 running locally on port `3306`

### Step 1: Configure Environment Variables
Inside `server/.env`:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database credentials
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD="your_mysql_password"
DB_NAME=eventease_db

# Security
JWT_SECRET=eventease_super_secret_jwt_key_2026_lavender_secure
JWT_EXPIRES_IN=24h

# Optional Google Gemini API Key (intelligent fallback included)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Step 2: Initialize Database Schema & Seed Data
From the `server/` directory:
```bash
cd server
npm install
npm run db:init
```
*This command creates the database `eventease_db`, builds all 16 tables with foreign keys and indexes, and seeds verified vendors, categories, customer events, and sample reviews.*

### Step 3: Start the Backend REST API
```bash
cd server
npm start
# Server runs on http://localhost:5000
```

### Step 4: Start the Frontend React Client
In a separate terminal:
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser.

---

## 6. Recommendation Scoring Algorithm

The standalone recommendation engine in `server/src/services/recommendationEngine.js` evaluates verified vendors on a 100-point deterministic scale:

$$\text{Score} = S_{\text{category}} + S_{\text{budget}} + S_{\text{location}} + S_{\text{availability}} + S_{\text{rating}}$$

1. **Category Match ($S_{\text{category}} \le 35\text{ pts}$)**: Hard gate. The vendor must offer at least one required category. If no services match, the vendor is excluded.
2. **Budget Alignment ($S_{\text{budget}} \le 25\text{ pts}$)**: Compares vendor starting price against allocated category budget. 25 pts for $\le 100\%$ allocation; decaying for slight overages; 2 pts for luxury offerings $>130\%$.
3. **Location & Coverage ($S_{\text{location}} \le 15\text{ pts}$)**: Exact city match yields 15 pts; neighboring regional radius match yields 11 pts.
4. **Date Availability ($S_{\text{availability}} \le 15\text{ pts}$)**: Checks `vendor_availability` for booked/blocked status on the event date. 15 pts if open; 0 pts if booked or blacked out.
5. **Rating & Reputation ($S_{\text{rating}} \le 10\text{ pts}$)**: Scaled by verified customer star rating (e.g., $4.9\star = 10\text{ pts}$, $4.7\star = 9\text{ pts}$).

---

## 7. Verified End-to-End User Journeys

1. **Host Journey**: Sign in as Customer ➔ Create Event with date & requirements ➔ View AI Rule-Based recommendations ➔ Inspect match explanations ➔ Send Booking Inquiry with custom offer.
2. **Vendor Journey**: Sign in as Vendor ➔ Receive booking inquiry notification ➔ Accept booking with proposed quote ➔ Date automatically locks in calendar ➔ Mark event completed after celebration.
3. **Review Journey**: Customer returns to Bookings ➔ Writes 5-star verified review ➔ Vendor's rolling average rating recalculates instantly.
4. **Admin Journey**: Sign in as Admin ➔ Monitor platform gross booking value ➔ Moderate vendor verification queue ➔ Inspect audit activity logs.
