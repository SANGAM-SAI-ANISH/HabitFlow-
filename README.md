# Pulse – Habit Flow Tracker

Pulse is a full‑stack habit tracking app that pairs a Flask + SQLite backend with a modern React/Tailwind front end. It lets you define custom streak targets, mark progress multiple times per day, reset habits as needed, and celebrate completions with subtle UI animations.

## Features
- Track unlimited habits with personalized completion targets.
- Visual progress rings with percentage indicators and toast notifications.
- Celebration overlay when a habit hits its target.
- Dark/light theme toggle persisted in `localStorage`.
- REST API powered by Flask + SQLAlchemy, stored in `instance/pulse.db`.

## Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide icons.
- **Backend:** Flask, Flask-CORS, Flask-SQLAlchemy, SQLite.

## Prerequisites
- Node.js 18+ and npm.
- Python 3.10+ and `pip`.

## Local Development

### 1. Backend (Flask)
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate    # PowerShell (use `source .venv/bin/activate` on macOS/Linux)
pip install -r requirements.txt
python app.py
```
The API starts on `http://localhost:5000` and automatically creates `instance/pulse.db`.

### 2. Frontend (Vite)
```bash
cd frontend
npm install
npm run dev
```
Vite serves the UI on the port it prints (default `http://localhost:5173`). The UI expects the backend at `http://localhost:5000`; update `API_URL` in `src/App.jsx` if you proxy or deploy elsewhere.

## API Overview
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/habits` | List all habits with progress percentage. |
| POST   | `/habits` | Create a habit. Body: `{ "name": string, "target": number? }`. |
| PUT    | `/habits/<id>/check` | Increment progress (capped at target). |
| PUT    | `/habits/<id>/reset` | Reset progress to zero. |
| DELETE | `/habits/<id>` | Remove a habit. |

## Project Structure
```
backend/   # Flask API and SQLite database
frontend/  # React client (Vite + Tailwind)
```

## Screenshoots

<img width="1919" height="973" alt="Screenshot 2025-11-27 194106" src="https://github.com/user-attachments/assets/224893a7-5f7c-4023-b780-6b7a421dad82" />


<img width="1919" height="968" alt="Screenshot 2025-11-27 194159" src="https://github.com/user-attachments/assets/3b14f81a-52af-4994-ba18-117bc5b7263b" />


Happy tracking! 🎯

