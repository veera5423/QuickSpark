# QuickSpark

QuickSpark is an AI-powered learning and career-preparation platform that helps users study smarter, practice interviews, and improve job readiness. The platform combines a Flask backend with a React + Vite frontend to deliver features such as document summarization, quiz generation, resume feedback, voice interview practice, and career exploration.

## Overview

QuickSpark is designed for learners and job seekers who want a single place to:

- upload learning materials and receive AI-generated summaries
- generate quizzes from documents or selected topics
- explore career paths and required skills
- check a resume against a job description
- practice voice-style interview questions
- browse and submit public learning resources

The project includes:

- a public landing experience
- user authentication and email verification
- a protected dashboard for learners
- an admin area for managing content and user requests

## Tech Stack

### Frontend
- React 19
- Vite
- React Router DOM
- Tailwind CSS
- Axios
- Lucide React
- React Hot Toast

### Backend
- Flask
- Flask-JWT-Extended
- Flask-CORS
- Flask-Mail
- MongoDB
- Google Gemini API
- SendGrid
- Supabase (used for related document/vector storage features)

## Project Structure

```text
QuickSpark/
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── db/
│   ├── extensions/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── router.jsx
│   ├── package.json
│   └── vite.config.js
└── package.json
```

## Main Features

### Learning and AI Tools
- AI-powered summarization for uploaded resources
- Quiz generation from text or stored content
- Resource-based chat and document learning workflows
- Resume review against job descriptions
- Voice interview question generation and evaluation

### Career and Community
- Career explorer with role and skill discovery
- Public resource submission and browsing
- Contact and feedback forms
- Admin moderation and verification flows

## Prerequisites

Make sure you have the following installed:

- Node.js 18+
- Python 3.10+
- MongoDB connection access
- Google Gemini API key
- SendGrid API key (for email features)
- Optional: Supabase credentials for related storage features

## Environment Variables

### Backend
Create a `.env` file inside the `backend` folder with values similar to:

```env
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_secret_key
MONGO_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_SENDER=your_sender_email
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
FRONTEND_URL=http://localhost:5173
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SUPABASE_BUCKET=your_bucket_name
SUPABASE_DB_URL=your_supabase_postgres_connection_string
```

### Frontend
Create a `.env` file inside the `frontend` folder:

```env
VITE_API_URL=http://127.0.0.1:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Installation and Setup

### 1. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

The backend will start on port `5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on port `5173`.

## Useful Scripts

### Frontend
- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

### Backend
- `python app.py` — start the Flask server

## API Overview

The backend exposes several feature-based routes, including:

- Authentication: `/auth`
- Summarization: `/api/summarizer`
- Quiz generation: `/api/quiz`
- Resume review: `/api/resume`
- Career explorer: `/api/career`
- Public resources: `/api/public`
- Admin actions: `/api/admin`
- Mail and feedback: `/api/mail`
- Voice interview: `/api/voice-interview`
- Room-related APIs: `/api/rooms`

## Notes

This project is intended as a full-stack AI application prototype and may require valid API credentials for full functionality. Make sure your environment variables are correctly configured before running the app.
