# QuickSpark AI - AI-Powered Learning Platform

A comprehensive AI-driven educational platform that revolutionizes study habits with instant document summarization, intelligent quiz generation, skill tracking, and career guidance.

## 🚀 Features

### Core AI Features
- **AI Document Summarization**: Upload PDFs and get instant, concise summaries with key takeaways
- **Smart Quiz Generation**: Create customized quizzes from your materials or specific skills
- **Resume Analysis**: AI-powered resume checking against job descriptions
- **Skill & Career Tracking**: Monitor progress and get personalized career recommendations

### Learning Tools
- **Interactive Chat**: Chat with your uploaded documents for deeper understanding
- **Public Resource Library**: Access community-shared learning materials
- **Career Explorer**: Detailed roadmaps for Frontend, Backend, AI, DevOps, and more
- **Progress Analytics**: Track learning journey with detailed statistics

### User Experience
- **Responsive Design**: Fully optimized for mobile and desktop
- **Google OAuth**: Seamless authentication with Google accounts
- **Real-time Collaboration**: Share and discover resources in the community
- **Dark/Light Theme**: Customizable interface (coming soon)

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Router** - Client-side routing

### Backend
- **Flask** - Lightweight Python web framework
- **MongoDB** - NoSQL database for flexible data storage
- **JWT** - Secure authentication tokens
- **Google Gemini AI** - Advanced AI for summarization and quiz generation
- **SendGrid** - Email service for notifications

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **MongoDB** (local or cloud instance)
- **Google Gemini API Key**
- **SendGrid API Key** (for email features)

## 🚀 Quick Start

### Backend Setup

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   Create a `.env` file in the backend directory:
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
   ```

5. **Run the backend:**
   ```bash
   python app.py
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://127.0.0.1:5000
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Run the frontend:**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
QuickSpark/
├── backend/
│   ├── app.py                 # Flask application entry point
│   ├── config.py             # Configuration settings
│   ├── models/               # Database models
│   ├── routes/               # API route handlers
│   ├── services/             # Business logic services
│   ├── utils/                # Utility functions
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context providers
│   │   ├── api/             # API client functions
│   │   ├── layouts/         # Layout components
│   │   └── styles/          # Global styles
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
└── README.md
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `python app.py` - Start Flask development server

## 🌐 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/google/login` - Google OAuth login

### Resources
- `GET /api/resources/` - Get user resources
- `POST /api/summarizer/upload-and-summarize` - Upload and summarize PDF

### Quizzes
- `POST /api/quiz/generate-quiz/{resourceId}` - Generate quiz from resource
- `POST /api/quiz/submit-quiz/{quizId}` - Submit quiz answers

### Career
- `GET /api/career/roadmaps` - Get career roadmaps
- `GET /api/career/skills/{skillId}` - Get skill details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support, email support@quickspark.ai or join our Discord community.

## 🙏 Acknowledgments

- Google Gemini AI for powering the AI features
- Tailwind CSS for the beautiful UI components
- Flask and React communities for excellent documentation

---

**Made with ❤️ by the QuickSpark AI Team**
