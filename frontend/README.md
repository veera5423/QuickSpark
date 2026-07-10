# QuickSpark AI

QuickSpark AI is an AI-powered learning and career-preparation platform. It helps users upload study material, generate summaries and quizzes, chat with resources, check resumes against job descriptions, practice interview questions, explore career paths, and browse community-shared materials.

This repository contains both the backend API and the React frontend.

## What the product does

QuickSpark is designed for a learner who wants one place to:

- upload a PDF or learning resource and get a concise summary
- generate quizzes from study material or a chosen skill
- review progress and target weak areas
- compare a resume with a job description
- practice a voice-style interview flow
- explore roles, skills, and career roadmaps
- submit and browse public resources

The app has a public landing page, authentication flow, a protected dashboard, and an admin area for managing content and users.

## Main user journey

1. A new visitor lands on the marketing homepage and sees the core value proposition.
2. They register or sign in, including Google-based sign-in support.
3. After login, they enter the dashboard where they can upload resources, create quizzes, and access learning tools.
4. Pro features such as resume checking and voice interview practice are exposed to eligible users.
5. Admin users can manage or verify content through dedicated routes.

## Core features

### Learning and AI tools

- Document summarization for uploaded PDFs
- Quiz generation from text or from stored resources
- Resource chat and document-based learning flows
- Resume analysis against a job description
- Voice interview practice and answer evaluation
- Skill tracking and career exploration

### Community and support

- Public resource submissions and browsing
- Contact and feedback email flows
- Public pages such as About, Blog, Terms, and Privacy Policy

### Access control

- Regular authenticated users can use the main learning dashboard
- Pro users or admins can access premium features like resume checking and voice interview tools
- JWT-based authentication protects private API routes

## Architecture at a glance

- Frontend: React 19, Vite, React Router, Tailwind CSS, Axios, Lucide icons, React Hot Toast
- Backend: Flask, Flask-JWT-Extended, Flask-CORS, Flask-Mail, Google Gemini, MongoDB, Supabase Postgres for embeddings, SendGrid
- Storage: MongoDB for users, resources, quizzes, career data, and public submissions
- AI layer: Gemini is used for summaries, quiz generation, resume feedback, and interview prompts

The frontend talks to the Flask backend through API wrappers in the `src/api` folder. The backend registers multiple blueprints for auth, summarization, quizzes, resume review, career exploration, public resources, mail, and voice interview features.

## Repository structure

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
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── context/
    │   ├── layouts/
    │   ├── pages/
    │   ├── router.jsx
    │   └── styles/
    ├── package.json
    └── vite.config.js
```

## Tech stack

### Frontend

- React 19
- Vite
- React Router DOM
- Tailwind CSS 4
- Axios
- Lucide React
- React Hot Toast

### Backend

- Flask
- Flask-CORS
- Flask-JWT-Extended
- Flask-Mail
- Google Generative AI
- MongoDB via PyMongo
- Supabase Postgres for vector/document chunk storage
- SendGrid for email delivery

## Setup requirements

- Node.js 18 or newer
- Python 3.8 or newer
- MongoDB connection string
- Google Gemini API key
- Google OAuth credentials if you want Google sign-in
- SendGrid API key for email features
- Supabase database URL if you want vector storage for document chunks

## Local setup

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a backend `.env` file with the required secrets and URLs:

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

Start the backend:

```bash
python app.py
```

The Flask server runs on port 5000 and exposes the API under the registered blueprints.

### 2. Frontend

```bash
cd frontend
npm install
```

Create a frontend `.env` file:

```env
VITE_API_URL=http://127.0.0.1:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start the frontend:

```bash
npm run dev
```

The Vite app runs on port 5173 by default.

## Available scripts

### Frontend

- npm run dev starts the development server
- npm run build creates a production build
- npm run preview previews the production build
- npm run lint runs ESLint

### Backend

- python app.py starts the Flask API

## Important backend routes

### Authentication

- POST /auth/register
- POST /auth/login
- GET /auth/google/login
- POST /auth/google/login
- GET /auth/google/callback
- GET /auth/verify-email/<token>
- POST /auth/resend_verification
- GET /auth/reset_password/<token>
- POST /auth/reset_password/<token>
- POST /auth/forgot_password
- GET /auth/me

### Resources and summarization

- GET /api/resources/
- POST /api/summarizer/upload-and-summarize

### Quizzes

- POST /api/quiz/generate-quiz-text
- POST /api/quiz/generate-quiz/<resource_id>
- POST /api/quiz/submit-quiz/<quiz_id>

### Resume review

- POST /api/resume/resume-check

### Career explorer

- GET /api/career/career-roles
- GET /api/career/career-roles/<role_id>
- GET /api/career/skills
- GET /api/career/skills/<skill_id>

### Public resources

- POST /api/public/submit-link
- POST /api/public/admin/verify/<resource_id>

### Voice interview

- POST /api/voice-interview/generate_questions
- POST /api/voice-interview/evaluate_all_answers

### Mail and feedback

- POST /api/mail/send-email
- POST /api/mail/submit-feedback

## Frontend routing overview

The React app is routed through `frontend/src/router.jsx` and separates the experience into:

- public pages such as the landing page, About, Blog, Contact, Terms, and Privacy Policy
- authentication pages for login, registration, password reset, and email verification
- protected dashboard pages for summaries, resources, quiz details, public resources, career tools, resume checking, mock tests, and voice interview practice
- admin-protected dashboard pages for administrative management

## Data and services

- MongoDB stores users, uploaded resources, quizzes, skills, career roles, and public submissions
- Supabase Postgres stores text chunks and embeddings for document retrieval workflows
- Gemini powers the summarization and generation features
- SendGrid is used for outgoing support and feedback email

## Notes for new contributors

- The backend uses usage limiting around several AI endpoints.
- Resume checking is treated as a premium feature, with a trial flow for non-pro users.
- Voice interview and resume tools are exposed in the UI only to eligible users.
- The repo already contains a structured frontend with shared components, context providers, layouts, and route guards.

## Contributing

1. Fork or branch from the repository.
2. Make your changes in a focused branch.
3. Run the frontend lint/build checks and any backend validation you need.
4. Open a pull request with a clear explanation of the change.

## License

This project is intended for educational and product-development use. Add or update the license section to match your distribution needs.
