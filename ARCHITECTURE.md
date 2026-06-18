# MockMate AI — Architecture Document
## 1. System Architecture

The system follows a client-server architecture with an additional AI service integration layer.

Frontend communicates with the backend through REST APIs. The backend handles authentication, interview logic, database operations, and AI communication. MongoDB is used for persistence, while Groq API is used for LLM-based evaluation.

Frontend → Backend → Database + AI Service

Frontend (React)

* User interface
* Interview flow
* Dashboard and results

Backend (Node.js + Express)

* API handling
* Authentication
* Interview orchestration
* AI integration layer

Database (MongoDB)

* Stores users, interviews, results, and proctor logs

External Service

* Groq API for LLM evaluation and feedback generation

---

## 2. Database Design

MongoDB is used as a document-based database. The system is organized into four primary collections.

### User Collection

Stores user credentials and references to activity.

Fields:

* name
* email
* password (hashed)
* createdAt

Relations:

* One user can have multiple interviews
* One user can have multiple results
* One user can have multiple proctor logs

---

### Interview Collection

Stores active and completed interview sessions.

Fields:

* userId
* questions array
* answers array
* status (ongoing, completed)
* score
* timestamps

---

### Result Collection

Stores final evaluation output of an interview session.

Fields:

* userId
* interviewId
* technicalScore
* communicationScore
* strengths
* weaknesses
* feedback
* createdAt

---

### ProctorLog Collection

Stores integrity monitoring events during interviews.

Fields:

* userId
* interviewId
* eventType (tab switch, window blur, violation)
* timestamp

---

## 3. Authentication Workflow

Authentication is implemented using JWT and bcrypt hashing.

Flow:

User registration
→ Password hashing using bcrypt
→ Store user in database
→ User login
→ Credential verification
→ JWT token generation
→ Token sent to frontend
→ Token used for protected routes

Security considerations:

* Passwords are never stored in plain text
* JWT is used for stateless authentication
* Middleware protects private routes
* Tokens expire after configured duration

---

## 4. AI Evaluation Workflow

The AI evaluation system is the core intelligence layer of the application.

Flow:

Question is presented to user
→ User submits response
→ Backend constructs structured prompt
→ Prompt is sent to Groq API
→ LLM generates structured JSON response
→ Backend parses response
→ Scores and feedback stored in database
→ Response sent to frontend

Evaluation criteria:

* Technical correctness
* Concept clarity
* Completeness
* Communication quality
* Relevance

Prompt structure is strictly defined to ensure consistent output format from the model.

---

## 5. Proctoring Workflow

The proctoring system monitors user behaviour during interviews to detect suspicious activity.

Events monitored:

* Tab switching
* Window losing focus
* Repeated violations
* Irregular activity patterns

Flow:

Interview starts
→ Event listeners activated in frontend
→ Suspicious activity detected
→ Event sent to backend
→ Logged in ProctorLog collection
→ Violation counter updated
→ Session flagged if threshold exceeded

This module ensures interview integrity and simulates real assessment environments.

---

## 6. End-to-End Interview Workflow

User logs in
→ Dashboard loads
→ Interview is selected
→ Backend fetches questions
→ Interview session begins
→ Question displayed to user
→ User submits answer
→ AI evaluates response
→ Score and feedback generated
→ Next question loaded
→ Process repeats until completion
→ Final result stored
→ Dashboard updated with performance data

---

## 7. Backend Architecture (Internal Design)

The backend follows a modular MVC-style structure.

Request Flow:

Routes
→ Controllers
→ Services
→ Models
→ Database

Responsibilities:

Routes:
Define API endpoints

Controllers:
Handle request and response logic

Services:
Contain business logic and AI integration

Models:
Define database schema

Middleware:
Handles authentication, validation, and error control

---

## 8. External Integrations

### Groq API

Used for large language model inference.

Responsibilities:

* Evaluate user responses
* Generate structured feedback
* Return scoring in JSON format

---

### JWT Authentication

Used for secure session management.

Features:

* Stateless authentication
* Token-based access control
* Route protection via middleware

---

## 9. Design Principles

The system is built with the following principles:

* Separation of concerns
* Modular backend structure
* Stateless authentication
* Scalable AI integration layer
* Secure data handling
* Clear API boundaries
* Extensibility for future features

---

## Summary

MockMate AI is a structured full-stack system combining interview simulation, AI-based evaluation, authentication, and behavioural monitoring. The architecture is designed to be scalable, maintainable, and extendable for production-level assessment systems.
