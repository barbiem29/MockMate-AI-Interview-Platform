#  MockMate AI – REST API Documentation

## Overview

MockMate AI exposes a RESTful API that powers every feature of the application, including authentication, interview management, AI evaluation, result generation, proctoring, question management, and the admin dashboard.

The backend follows a modular Express.js architecture where each feature is organized into its own route, controller, middleware, and model. All endpoints communicate using JSON and most require JWT authentication.

---

# Base URL

```
http://localhost:5000/api
```

---
POST /signup

POST /login

GET /questions

POST /interview/start

POST /interview/answer

POST /interview/end

GET /results

GET /history

# Authentication

Most endpoints require a valid JWT token.

Include the following header in every protected request:

```
Authorization: Bearer <your_jwt_token>
```

---

# API Routes Overview

| Module         | Base Route       | Description                             |
| -------------- | ---------------- | --------------------------------------- |
| Authentication | `/api/auth`      | User registration, login and profile    |
| Questions      | `/api/questions` | Retrieve and manage interview questions |
| Interviews     | `/api/interview` | Start and manage interview sessions     |
| Results        | `/api/results`   | View interview results and AI feedback  |
| Proctor        | `/api/proctor`   | Store and retrieve proctoring events    |
| Admin          | `/api/admin`     | Platform analytics and dashboard        |

---

# Authentication APIs

## Register User

### POST

```
/api/auth/signup
```

Registers a new user account.

### Request Body

```json
{
    "fullName": "Smiriti Mathur ",
    "email": "smiriti@test.com",
    "password": "password123"
}
```

---

## Login User

### POST

```
/api/auth/login
```

Authenticates a user and returns a JWT access token.

### Request Body

```json
{
    "email": "smiriti@test.com",
    "password": "password123"
}
```

### Response

```json
{
    "success": true,
    "token": "<jwt_token>",
    "user": {
        "_id": "64f8c1e8b9a7c2d4e5f67890",
        "fullName": "Smiriti Mathur",
        "email": "smiriti@test.com"
    }
}
```

---

## Get Logged-in User

### GET

```
/api/auth/me
```

Returns details of the currently authenticated user.

Authentication Required

---

# Question APIs

## Get All Questions

### GET

```
/api/questions
```

Returns all available interview questions.

Authentication Required

---

## Get Question by ID

### GET

```
/api/questions/64f8c3d4b9a7c2d4e5f67912
```

Returns details of a single question.

Authentication Required

---

## Create New Question

### POST

```
/api/questions
```

Creates a new interview question.

**Admin Access Only**

Example Request

```json
{
    "questionText": "Explain Binary Search.",
    "difficulty": "Medium",
    "category": "DSA"
}
```

---

# Interview APIs

## Start Interview

### POST

```
/api/interview/start
```

Creates a new interview session for the authenticated user.

Authentication Required

---

## Get Interview Details

### GET

```
/api/interview/64f8d0b2b9a7c2d4e5f67955
```

Returns complete interview information including metadata and progress.

---

## Get Next Question

### GET

```
/api/interview/64f8d0b2b9a7c2d4e5f67955/next-question
```

Fetches the next interview question.

---

## Submit Answer

### POST

```
/api/interview/64f8d0b2b9a7c2d4e5f67955/question/64f8c3d4b9a7c2d4e5f67912/answer
```

Submits the user's answer for evaluation.

### Request

```json
{
    "answer":"Binary Search works by repeatedly dividing a sorted array into halves until the target element is found."
}
```



---

## End Interview

### POST

```
/api/interview/64f8d0b2b9a7c2d4e5f67955/end
```

Marks the interview as completed and generates the final report.

---

# Result APIs

## Get All Results

### GET

```
/api/results
```

Returns every interview result belonging to the authenticated user.

---

## Get Result by Interview ID

### GET

```
/api/results/64f8d0b2b9a7c2d4e5f67955
```

Returns the AI evaluation, score, strengths, weaknesses and feedback for a specific interview.

---

# Proctor APIs

## Record Proctor Event

### POST

```
/api/proctor
```

Logs suspicious activity during an interview.

Example

```json
{
    "interviewId":"64f8d0b2b9a7c2d4e5f67955",
    "eventType":"TAB_SWITCH"
}
```

Supported Events

* TAB_SWITCH
* WINDOW_BLUR
* COPY_ATTEMPT
* MULTIPLE_FACES

---

## Get Proctor Logs

### GET

```
/api/proctor/64f8d0b2b9a7c2d4e5f67955
```

Returns all proctoring events recorded during an interview.

---

# Admin APIs

## Dashboard

### GET

```
/api/admin/dashboard
```

Accessible only by administrators.

Provides overall platform analytics.

Returns

* Total Users
* Total Interviews
* Total Questions
* Total Results
* Overall Platform Statistics

---

# Project Structure

```
MockMate-AI-Interview-Platform
│
├── backend
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── uploads
│   ├── utils
│   ├── query
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── context
│   │   ├── pages
│   │   ├── services
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
│
├── README.md
├── API.md
└── .gitignore
```

---

# HTTP Status Codes

| Code | Description           |
| ---- | --------------------- |
| 200  | Request Successful    |
| 201  | Resource Created      |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Resource Not Found    |
| 500  | Internal Server Error |

---

# Security Features

* JWT Authentication
* Password Hashing using bcrypt
* Role-Based Authorization
* Protected Routes
* Environment Variables
* Input Validation Middleware

---

# Technologies Used

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose

### Frontend

* React.js
* Vite
* Axios
* React Router
* Tailwind CSS

### Authentication

* JWT
* bcryptjs

### AI Integration

* Groq API
* Llama 3

### Additional Packages

* dotenv
* cors
* multer
* express-validator

---
## Backend Workflow

```text
Client Request
      │
      ▼
Express Route
      │
      ▼
Authentication Middleware (JWT)
      │
      ▼
Authorization Middleware (Admin/User)
      │
      ▼
Request Validation
      │
      ▼
Controller
      │
      ▼
Business Logic
      │
      ├──────────────► MongoDB (Read / Write Data)
      │
      └──────────────► Groq API (AI Evaluation)
      │
      ▼
JSON Response
      │
      ▼
React Frontend
```

---

## API Workflow

```text
User Action
(Login / Start Interview / Submit Answer)
                    │
                    ▼
         Axios HTTP Request
                    │
                    ▼
          Express API Endpoint
                    │
                    ▼
      JWT Authentication Check
                    │
                    ▼
      Controller Executes Logic
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
   MongoDB Atlas           Groq AI API
(Store / Retrieve)     (Evaluate Answers)
        │                       │
        └───────────┬───────────┘
                    ▼
         Generate Final Response
                    │
                    ▼
            Return JSON Response
                    │
                    ▼
       Display Data on Frontend
```
