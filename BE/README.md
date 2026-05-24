# EchoWork Backend API

> Recruitment platform for people with disabilities — Node.js + Express + MySQL + Prisma MVP

---

## Tech Stack

| Layer         | Technology              |
|---------------|-------------------------|
| Runtime       | Node.js                 |
| Framework     | Express.js v5           |
| Database      | MySQL                   |
| ORM           | Prisma                  |
| Auth          | JWT + bcryptjs          |
| File Upload   | Multer                  |
| PDF Export    | Puppeteer               |
| Validation    | express-validator        |
| Security      | Helmet + CORS + dotenv  |
| Logging       | Morgan                  |

---

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   └── prisma.js          # Prisma singleton client
│   ├── controllers/           # Request handlers (thin layer)
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── job.controller.js
│   │   ├── application.controller.js
│   │   ├── cv.controller.js
│   │   ├── accessibility.controller.js
│   │   └── admin.controller.js
│   ├── services/              # Business logic
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── job.service.js
│   │   ├── application.service.js
│   │   ├── cv.service.js
│   │   ├── accessibility.service.js
│   │   └── admin.service.js
│   ├── routes/                # Express routers
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── job.routes.js
│   │   ├── application.routes.js
│   │   ├── cv.routes.js
│   │   ├── accessibility.routes.js
│   │   └── admin.routes.js
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT verification
│   │   ├── role.middleware.js      # RBAC
│   │   ├── validate.middleware.js  # express-validator errors
│   │   ├── upload.middleware.js    # Multer configs
│   │   └── error.middleware.js     # Global error handler
│   ├── validations/
│   │   ├── auth.validation.js
│   │   ├── user.validation.js
│   │   ├── job.validation.js
│   │   └── cv.validation.js
│   ├── utils/
│   │   ├── response.util.js   # Standardized { success, message, data }
│   │   └── pdf.util.js        # Puppeteer PDF generator
│   ├── uploads/
│   │   ├── avatars/           # User avatar files
│   │   └── cvs/               # CV document uploads
│   └── app.js                 # Express app setup
├── .env                       # Environment variables
├── .env.example               # Template
├── server.js                  # Entry point
└── package.json
```

---

## Setup & Installation

### 1. Install dependencies
```bash
cd BE
npm install
```

### 2. Configure environment
```bash
# Edit .env with your MySQL credentials
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/echowork_db"
JWT_SECRET=your_secret_key_here
```

### 3. Create the database
```sql
CREATE DATABASE echowork_db;
```

### 4. Run Prisma migration
```bash
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client
```bash
npx prisma generate
```

### 6. Start the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:3000`

---

## API Reference

### Base URL
```
http://localhost:3000/api
```

### Response Format
All responses follow this shape:
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

---

### 🔐 Auth Module

| Method | Endpoint             | Auth | Description    |
|--------|----------------------|------|----------------|
| POST   | `/auth/register`     | ❌   | Register user  |
| POST   | `/auth/login`        | ❌   | Login & get JWT|

**Register Body:**
```json
{
  "fullName": "Nguyen Van A",
  "email": "user@example.com",
  "password": "password123",
  "role": "CANDIDATE",
  "disability": "Visual impairment"
}
```

**Login Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { "id": 1, "fullName": "Nguyen Van A", "role": "CANDIDATE" }
  }
}
```

---

### 👤 User Module

| Method | Endpoint          | Auth | Description         |
|--------|-------------------|------|---------------------|
| GET    | `/users/profile`  | ✅   | Get own profile     |
| PUT    | `/users/profile`  | ✅   | Update profile      |

**PUT /users/profile** (multipart/form-data):
- `fullName` (string, optional)
- `disability` (string, optional)
- `avatar` (file, optional — JPEG/PNG/WebP max 5MB)

---

### 💼 Job Module

| Method | Endpoint      | Auth           | Description       |
|--------|---------------|----------------|-------------------|
| GET    | `/jobs`       | ❌             | List & search     |
| GET    | `/jobs/:id`   | ❌             | Get single job    |
| POST   | `/jobs`       | RECRUITER/ADMIN| Create job        |
| PUT    | `/jobs/:id`   | RECRUITER/ADMIN| Update job        |
| DELETE | `/jobs/:id`   | RECRUITER/ADMIN| Delete job        |

**Query params for GET /jobs:**
- `search` — searches title, company, description
- `location` — filter by location
- `minSalary` / `maxSalary` — salary range
- `page` / `limit` — pagination (default: page=1, limit=10)

---

### 📋 Application Module

| Method | Endpoint                      | Auth           | Description          |
|--------|-------------------------------|----------------|----------------------|
| POST   | `/applications`               | CANDIDATE      | Apply to job         |
| GET    | `/applications`               | ✅             | List (role-scoped)   |
| PATCH  | `/applications/:id/status`    | RECRUITER/ADMIN| Update status        |

**POST /applications Body:**
```json
{ "jobId": 5 }
```

**PATCH /applications/:id/status Body:**
```json
{ "status": "ACCEPTED" }
```
Status values: `PENDING` | `ACCEPTED` | `REJECTED`

---

### 📄 CV Module

| Method | Endpoint              | Auth | Description     |
|--------|-----------------------|------|-----------------|
| POST   | `/cv`                 | ✅   | Create CV       |
| GET    | `/cv/:id`             | ✅   | Get CV          |
| PUT    | `/cv/:id`             | ✅   | Update CV       |
| GET    | `/cv/download/:id`    | ✅   | Export PDF      |

**CV Body:**
```json
{
  "summary": "Passionate software developer...",
  "education": [{ "degree": "B.Sc CS", "school": "FPT", "year": "2025" }],
  "experience": [{ "position": "Developer", "company": "ABC Corp", "duration": "2023–2025" }],
  "skills": ["JavaScript", "Node.js", "MySQL"],
  "template": "modern"
}
```

---

### ♿ Accessibility Module

| Method | Endpoint          | Auth | Description      |
|--------|-------------------|------|------------------|
| GET    | `/accessibility`  | ✅   | Get settings     |
| PUT    | `/accessibility`  | ✅   | Update settings  |

**PUT Body:**
```json
{
  "fontSize": "large",
  "contrastMode": "high"
}
```
fontSize: `small` | `medium` | `large`
contrastMode: `normal` | `high` | `dark`

---

### 🛡️ Admin Module

| Method | Endpoint                  | Auth  | Description          |
|--------|---------------------------|-------|----------------------|
| GET    | `/admin/users`            | ADMIN | List all users       |
| DELETE | `/admin/users/:id`        | ADMIN | Delete a user        |
| GET    | `/admin/jobs`             | ADMIN | List all jobs        |
| GET    | `/admin/statistics`       | ADMIN | Platform stats       |

---

## Authentication Flow

```
1. POST /api/auth/register → create account
2. POST /api/auth/login    → receive { token, user }
3. All protected requests:
   Header: Authorization: Bearer <token>
```

---

## Roles & Permissions

| Action                | CANDIDATE | RECRUITER | ADMIN |
|-----------------------|-----------|-----------|-------|
| Register / Login      | ✅        | ✅        | ✅    |
| View Jobs             | ✅        | ✅        | ✅    |
| Create / Edit Jobs    | ❌        | ✅        | ✅    |
| Apply to Jobs         | ✅        | ❌        | ❌    |
| View Applications     | Own only  | Own jobs  | All   |
| Update App Status     | ❌        | ✅        | ✅    |
| Manage CV             | ✅        | ❌        | ✅    |
| Accessibility         | ✅        | ✅        | ✅    |
| Admin Dashboard       | ❌        | ❌        | ✅    |

---

## HTTP Status Codes

| Code | Meaning               |
|------|-----------------------|
| 200  | OK                    |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 500  | Internal Server Error |
