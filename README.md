# MockMate AI – Interview Practice Platform

![React](https://img.shields.io/badge/Frontend-React-blue)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green)
![Express](https://img.shields.io/badge/API-Express-black)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)
![AI](https://img.shields.io/badge/AI-Powered-purple)
![Status](https://img.shields.io/badge/Project-Active-success)


# Overview
Preparing for technical interviews without a mentor is difficult. Most candidates either memorize answers or solve coding questions without receiving meaningful feedback on their communication, technical understanding, or interview performance.

MockMate AI provides a realistic interview environment where candidates answer technical questions, receive AI-generated evaluations, review their performance history, and identify areas requiring improvement.
The platform also includes interview monitoring mechanisms to discourage dishonest behaviour during assessments.

#  Features
##  User Authentication
* User Registration
* Secure Login
* Password Hashing using bcrypt
* JWT Authentication
* Protected Routes


## AI Mock Interviews
* Technical Interview Questions
* Multi-round Interview Sessions
* Dynamic Question Flow
* AI Answer Evaluation
* Automatic Score Generation


## Performance Dashboard
Users can view:
* Total Interviews
* Overall Scores
* Recent Performance
* Interview History
* Detailed Feedback Reports


## AI Evaluation
Candidate responses are evaluated using an LLM.
Evaluation Criteria:

* Technical Accuracy
* Completeness
* Communication
* Clarity
* Relevance
* Confidence

Generated Report includes:
* Overall Score
* Technical Score
* Communication Score
* Strengths
* Weaknesses
* Suggestions for Improvement

---

## Proctoring System
MockMate AI monitors interview integrity by detecting:
* Browser Tab Switching
* Window Focus Loss
* Multiple Violations
* Suspicious Behaviour
Every event is stored for later review.
# Tech Stack
## Frontend
* React.js
* React Router
* Axios
* Context API
* CSS / Tailwind CSS
  
## Backend
* Node.js
* Express.js
* REST API
* JWT Authentication
* bcrypt
* Groq API Integration


## Database
MongoDB
Collections:
* Users
* Questions
* Interviews
* Results
* ProctorLogs


# Environment Variables

Create a `.env` file inside the backend directory.

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/mockmate?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=replace_with_a_secure_random_secret_key
JWT_EXPIRES_IN=7d

# Groq AI
GROQ_API_KEY=your_groq_api_key
```

> **Important:** Never commit your `.env` file or expose sensitive credentials. Add `.env` to your `.gitignore`.

---

# Installation & setup

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/mockmate-ai.git

cd mockmate-ai
```



## 2. Backend Setup

```bash
cd backend

npm install
```

Create a `.env` file and configure all required environment variables.

Start the backend server:

```bash
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## 3. Frontend Setup

Open a new terminal.

```bash
cd frontend

npm install
```

Start the React application:

```bash
npm start
```

Frontend runs on:

```
http://localhost:3000
```

---

# Application Testing
### Step 1 — Register
* Open the application.
* Create a new account using your name, email, and password.
* Passwords are securely hashed before being stored.
---

### Step 2 — Login
* Enter registered credentials.
* Backend verifies the user.
* A JWT token is generated.
* Protected routes become accessible.

---

### Step 3 — Dashboard
After successful login, the user is redirected to the dashboard where they can:
* View previous interview history
* Check performance statistics
* Start a new mock interview
---

### Step 4 — Start Interview
* Select an interview.
* Backend loads technical questions from the database.
* Interview session is created.
---

### Step 5 — Answer Questions
* Candidate submits answers one by one.
* Responses are temporarily stored.
* Browser activity is monitored for integrity.
---

### Step 6 — AI Evaluation
Each answer is sent to the Groq API.
The AI evaluates:
* Technical correctness
* Clarity
* Completeness
* Communication
* Relevance

Scores and detailed feedback are generated automatically.
---

### Step 7 — Interview Completion
When all questions are answered:
* Final scores are calculated.
* AI feedback is compiled.
* Results are stored in MongoDB.

---

### Step 8 — Review Results
Users can access:
* Overall Score
* Technical Score
* Communication Score
* Strengths
* Weaknesses
* Suggestions
* Previous Interview History


