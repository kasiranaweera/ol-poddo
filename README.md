# ol-poddo

A comprehensive learning platform designed for O-Level students to share resources, collaborate on studies, and prepare for exams.

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Contributing](#contributing)
- [License](#license)

## 📚 About

**ol-poddo** is a web platform built to support O-Level students by providing a centralized hub for:
- Sharing and discovering study materials
- Collaborative learning through forums
- Document management and organization
- Resource recommendations and ratings
- Grade tracking and progress monitoring

## ✨ Features

- **User Authentication**: Secure registration and login with email verification
- **Document Management**: Upload and organize notes, papers, and study materials
- **Resource Sharing**: Share educational resources with the community
- **Forum System**: Engage in discussions with peers
- **Question Bank**: Create and answer practice questions
- **Google Drive Integration**: Seamlessly integrate with Google Drive for document storage
- **Theme Support**: Dark and light theme options
- **Multi-language Support**: Internationalization ready (Language Context)
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: SQLAlchemy ORM with SQL databases
- **Authentication**: Python-Jose, Passlib, Bcrypt
- **API Security**: CORS, Trusted Host middleware
- **Email**: Email validation and sending
- **Cloud Storage**: Google Drive integration
- **Deployment**: Vercel

**Key Dependencies**:
- FastAPI 0.104.1
- SQLAlchemy 2.0.36
- Pydantic 2.10.0+
- Google Auth libraries
- Python-dotenv 1.0.0

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.2.0
- **Styling**: Tailwind CSS 3.4.1
- **Routing**: React Router DOM 6.24.0
- **HTTP Client**: Axios 1.13.2
- **UI Components**: Radix UI, Lucide React
- **Deployment**: Vercel

**Key Dependencies**:
- React 18.3.1
- React Router DOM 6.24.0
- Tailwind CSS 3.4.1
- Axios
- Embla Carousel (for slideshows)

## 📁 Project Structure

```
ol-poddo/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies
│   ├── vercel.json            # Vercel deployment config
│   ├── api/
│   │   └── index.py           # API routes wrapper
│   ├── core/
│   │   ├── config.py          # Configuration settings
│   │   ├── database.py        # Database setup
│   │   ├── email.py           # Email utilities
│   │   ├── google_drive.py    # Google Drive integration
│   │   ├── google_drive_oauth.py # OAuth configuration
│   │   └── security.py        # Security utilities
│   ├── models/
│   │   ├── user.py            # User model
│   │   ├── document.py        # Document models
│   │   ├── forum.py           # Forum models
│   │   ├── grade.py           # Grade models
│   │   ├── note.py            # Note models
│   │   ├── question.py        # Question/Answer models
│   │   ├── resource.py        # Resource models
│   │   └── token.py           # Token models
│   ├── routes/
│   │   ├── auth.py            # Authentication routes
│   │   ├── users.py           # User management routes
│   │   ├── documents.py       # Document routes
│   │   ├── resources.py       # Resource routes
│   │   ├── notes.py           # Note routes
│   │   ├── forum.py           # Forum routes
│   │   ├── questions.py       # Question routes
│   │   ├── files.py           # File handling routes
│   │   └── account.py         # Account management routes
│   ├── schemas/
│   │   ├── user.py            # User validation schemas
│   │   └── document.py        # Document validation schemas
│   └── keys/
│       ├── drive-key.json.json # Google Drive API key
│       └── outh-key.json       # OAuth credentials
│
├── frontend/
│   ├── index.html             # HTML entry point
│   ├── package.json           # Node.js dependencies
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind CSS config
│   ├── postcss.config.js      # PostCSS config
│   ├── vercel.json            # Vercel deployment config
│   └── src/
│       ├── main.jsx           # React entry point
│       ├── App.jsx            # Main App component
│       ├── index.css          # Global styles
│       ├── components/
│       │   ├── Header.jsx
│       │   ├── Footer.jsx
│       │   ├── Logo.jsx
│       │   ├── ThemeToggle.jsx
│       │   └── common/        # Reusable UI components
│       │       ├── Button.jsx
│       │       ├── Card.jsx
│       │       ├── Accordion.jsx
│       │       ├── Badge.jsx
│       │       └── ...
│       ├── context/
│       │   ├── AuthContext.jsx    # Authentication state
│       │   ├── LanguageContext.jsx # Language/i18n state
│       │   └── ThemeContext.jsx    # Theme state
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── AccountPage.jsx
│       │   ├── Documents.jsx
│       │   ├── Resources.jsx
│       │   ├── Paper.jsx
│       │   └── ...
│       ├── services/
│       │   ├── auth.api.js        # Auth API calls
│       │   ├── document.api.js    # Document API calls
│       │   ├── user.api.js        # User API calls
│       │   └── common/
│       │       └── clients.js     # Axios client config
│       └── utils/
│           ├── classNames.js
│           └── cn.js             # Tailwind class utilities
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

**Backend**:
- Python 3.8+
- pip (Python package manager)
- SQLite or PostgreSQL database

**Frontend**:
- Node.js 18.x+
- npm or yarn

### Backend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kasiranaweera/ol-poddo.git
   cd ol-poddo/backend
   ```

2. **Create a virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables** (see [Environment Variables](#environment-variables))

5. **Run migrations** (if applicable):
   ```bash
   # Database tables are auto-created on app startup
   ```

6. **Start the backend server**:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`
   - API Documentation: `http://localhost:8000/api/docs`
   - ReDoc: `http://localhost:8000/api/redoc`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd ol-poddo/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables** (see [Environment Variables](#environment-variables))

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

5. **Build for production**:
   ```bash
   npm run build
   ```

## 🔐 Environment Variables

### Backend (`.env` in `backend/` directory)

```env
# Database
DATABASE_URL=sqlite:///./test.db
# or for PostgreSQL: postgresql://user:password@localhost/dbname

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Google Drive & OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# API
API_URL=http://localhost:8000
```

### Frontend (`.env` in `frontend/` directory)

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_APP_NAME=ol-poddo
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend**:
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

### Production Build

**Backend**:
```bash
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Frontend**:
```bash
npm install
npm run build
npm run preview
```

## 📚 API Documentation

The API is documented using OpenAPI (Swagger) and ReDoc. After starting the backend, visit:

- **Swagger UI**: `http://localhost:8000/api/docs`
- **ReDoc**: `http://localhost:8000/api/redoc`

### Main API Endpoints

- **Authentication**: `/auth/` - Login, Register, Token refresh
- **Users**: `/users/` - User profiles and management
- **Documents**: `/documents/` - Papers, textbooks, study notes
- **Resources**: `/resources/` - Educational resources
- **Notes**: `/notes/` - Study notes and materials
- **Forum**: `/forum/` - Forum posts and comments
- **Questions**: `/questions/` - Practice questions and answers
- **Files**: `/files/` - File upload and download

## 🗄️ Database Schema

The application uses SQLAlchemy ORM with the following main models:

- **User**: User accounts and profiles
- **Document**: Papers, textbooks, and study materials
- **Resource**: Shared educational resources with categories
- **Note**: Study notes and materials
- **ForumPost / ForumComment**: Forum discussions
- **Question / Answer**: Practice question bank
- **Grade / Subject**: Grade tracking
- **VerificationToken / PasswordResetToken**: Token management

## 🔑 Authentication

The application uses JWT (JSON Web Tokens) for authentication:

1. Users register with email and password
2. Email verification is required
3. Tokens are issued upon successful login
4. Refresh tokens allow extended sessions
5. OAuth integration with Google for social login

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with Kasi Ranaweera for O-Level students**
