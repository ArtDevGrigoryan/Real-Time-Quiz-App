# Real-Time Quiz Session System

## Project Description

This project is a **real-time multiplayer quiz platform** where an admin hosts live sessions and participants join using a **room code or QR code**. The admin fully controls the flow of the session while participants receive real-time updates through WebSockets.

The application focuses on **synchronization, real-time communication, and server-controlled session state**. Participants never navigate manually — all screen transitions are triggered by the admin and pushed to connected clients.

Sessions contain multiple activities such as **quiz rounds** and **puzzle assembly tasks**. During the session, participants answer questions, submit puzzle scores, and see a live leaderboard that updates after every activity.

---

## Task Description

The system was implemented as part of a **student assignment** requiring a complete full-stack application with the following characteristics:

* An **admin panel** used to create and control live quiz sessions.
* **Anonymous participants** who join using a room code.
* **Real-time synchronization** between admin and participants using WebSockets.
* **Server-side timers and scoring logic** to ensure consistency and prevent cheating.
* **Leaderboard updates** after each scored activity.

The application supports multiple concurrent sessions while ensuring that events from one session never affect another.

Key functionality includes:

* Admin authentication
* Session creation and management
* Real-time participant lobby
* Quiz questions with time-weighted scoring
* Puzzle activities with admin score confirmation
* Persistent results and leaderboards

---

## Session Template System

Instead of building a content editor, session content is provided through a **JSON template file** (`session_template.json`).

This file contains:

* Quiz rounds
* Questions and answer options
* Puzzle activities
* Scoring configuration
* Activity timing

The template is **validated on server startup using Zod** to ensure structural correctness before any session can be created.

---

## Optimized Session Creation

To avoid repeatedly inserting identical activity and question data when creating new sessions, the system uses a **template-based insertion strategy**.

A **template session structure** is stored and reused when creating new sessions.  
When an admin creates a session, the system:

1. Generates a unique **room code**.
2. Creates a **session record**.
3. References the preloaded **template activities** instead of duplicating them.

This approach provides several benefits:

* Reduces database write operations
* Prevents unnecessary duplication of activity data
* Improves performance when creating new sessions
* Keeps session creation logic simple and predictable

Only **session-specific data** such as participants, answers, and scores are stored per session.

---

## Scoring System

### Quiz Scoring

Correct answers are scored using **time-weighted logic**:

* Fastest correct answer → **100 points**
* Last-second correct answer → **~51 points**
* Incorrect or missing answer → **0 points**

Score calculation happens **entirely on the server**.

### Puzzle Activity Scoring

Participants submit the number of correctly completed fragments.

Scores are only applied **after admin confirmation**.

---

## Real-Time Architecture

The system uses **Socket.io** to synchronize all clients with the admin.

**Admin → Clients**:

* session started
* activity started
* question closed
* leaderboard update

**Client → Server**:

* join session
* submit answer
* submit puzzle score

Each session runs in its own **Socket room**, ensuring isolation between concurrent sessions.

---

## Server-Side Timer

Timers run exclusively on the **server**.

If a participant refreshes during a question:

* The server calculates remaining time
* The client receives the correct timer state

This prevents timer desynchronization across clients.

---

## Architecture & Decisions

* **Full-stack TypeScript**: ensures type safety across frontend and backend.
* **Socket.io rooms**: isolate concurrent sessions.
* **Template-based session insertion**: avoids redundant DB writes.
* **Server-side scoring & timers**: prevents cheating and keeps all clients synchronized.
* **Zod validation**: guarantees correct session content before session creation.
* **Leaderboard system**: efficiently updates top 5 + personal rank for participants.

# Run project locally / backend
# Create a .env file based on .env.example and update variables if needed.
# Seed the database to create the admin user:

```bash
cd backend/
npm i
npm run seed
npm run dev
```
# Run porject locally / frontend
# Create a .env file based on .env.example and update variables if needed.

```bash
cd frontend/
npm i
npm run dev
```
