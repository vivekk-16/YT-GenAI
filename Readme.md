# YT-GENAI

A full-stack web application for YouTube Generative AI content creation, featuring user authentication and AI-powered features.

## Features

- User registration and login
- JWT-based authentication
- Secure password hashing
- MongoDB database integration
- Responsive React frontend with Vite
- Express.js backend API

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Cookie parsing for session management

### Frontend

- React 19
- Vite for build tooling
- React Router for navigation
- Sass for styling
- ESLint for code linting

## Project Structure

```
YT-GENAI/
├── Backend/
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config/
│       │   └── database.js
│       ├── controllers/
│       │   └── auth.controller.js
│       ├── middlewares/
│       │   └── auth.middleware.js
│       ├── models/
│       │   ├── blacklist.model.js
│       │   └── user.model.js
│       └── routes/
│           └── auth.route.js
├── Frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx
│       ├── app.routes.jsx
│       ├── main.jsx
│       ├── style.scss
│       ├── features/
│       │   ├── ai/
│       │   └── auth/
│       │       ├── auth.form.scss
│       │       ├── components/
│       │       └── pages/
│       │           ├── Login.jsx
│       │           └── Register.jsx
│       └── styles/
│           └── button.scss
└── README.md
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. Navigate to the Backend directory:

   ```bash
   cd Backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the Backend directory with the following variables:

   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the Frontend directory:

   ```bash
   cd Frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Ensure MongoDB is running
2. Start the backend server (runs on port 3000)
3. Start the frontend server (runs on port 5173 by default)
4. Open your browser and navigate to the frontend URL
5. Register a new account or login with existing credentials

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.
