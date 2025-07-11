# Grynd - JEE Study Planner Application

A comprehensive study planner application designed specifically for JEE (Joint Entrance Examination) preparation. Built with modern web technologies and featuring a complete suite of study management tools.

## Features

### 📊 Analytics Dashboard
- Interactive pie charts showing study time breakdown by subject
- Real-time progress tracking and statistics
- Visual representation of study patterns

### 🎯 Goals & Streaks System
- Daily goal setting with customizable targets
- Progress tracking with visual progress bars
- Streak calculation for consecutive study days
- Achievement tracking and motivation

### ⏱️ Enhanced Study Timer
- **Pause/Resume Functionality**: Full control over study sessions
- **Session Confirmation**: Modal prompt for subject selection and note-taking
- **Real-time Updates**: Automatic refresh of dashboard statistics
- Circular progress indicator with customizable duration

### 📝 To-Do Manager
- Task management organized by subject
- Optional due date tracking
- Status management (pending/completed)
- Subject-based filtering and organization

### 📚 Session History
- Complete record of all study sessions
- Detailed view with subject, duration, date, and notes
- Smart date formatting (Today, Yesterday, etc.)
- Export and review capabilities

### 🧠 Smart Suggestions
- AI-powered recommendations based on study patterns
- Identifies subjects with less than 20% of weekly study time
- Proactive suggestions for balanced study schedule
- Dismissible notification system

### 🎨 Subject Management
- Create and manage study subjects
- Color-coded organization system
- Custom color selection from predefined palette
- Edit and delete functionality

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** with CSS variables for theming
- **TanStack Query** (React Query) for server state management
- **Wouter** for lightweight client-side routing
- **Recharts** for data visualization

### Backend
- **Node.js** with Express.js framework
- **TypeScript** with ES modules
- **PostgreSQL** with Neon serverless hosting
- **Drizzle ORM** for type-safe database operations
- **Session Storage** with PostgreSQL-based storage

### Database Schema
- **Users**: Basic user authentication and profile management
- **Subjects**: Study subjects with customizable colors
- **Study Sessions**: Time tracking with subject association and notes
- **Daily Goals**: Target minutes per day with completion tracking
- **Todos**: Task management organized by subject with due dates
- **Playlists**: YouTube/study material links organized by subject
- **Settings**: User preferences and configuration

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your PostgreSQL database URL to `DATABASE_URL`

4. Push database schema:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Usage

1. **Create Subjects**: Start by adding your study subjects (Physics, Mathematics, Chemistry, etc.)
2. **Set Daily Goals**: Define your daily study targets
3. **Use the Timer**: Start study sessions with pause/resume functionality
4. **Track Progress**: Monitor your study patterns through the analytics dashboard
5. **Manage Tasks**: Add and organize your to-do items by subject
6. **Review History**: Check your past study sessions and progress

## Key Features in Detail

### Timer System
- Select subject before starting
- Pause and resume sessions as needed
- Session completion modal for notes and confirmation
- Automatic progress updates

### Analytics Dashboard
- Time aggregation by subject
- Interactive tooltips with detailed breakdowns
- Percentage-based progress tracking
- Visual data representation

### Goals and Streaks
- Daily goal setting and modification
- Visual progress bars
- Automatic streak calculation
- Achievement tracking

## Development

### Project Structure
```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-based page components
│   │   ├── lib/          # Utility functions and configurations
│   │   └── hooks/        # Custom React hooks
├── server/               # Backend Express application
│   ├── db.ts            # Database connection
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Database storage layer
│   └── index.ts         # Server entry point
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema definitions
└── package.json         # Project dependencies
```

### API Endpoints
- `GET /api/subjects` - List all subjects
- `POST /api/subjects` - Create new subject
- `GET /api/study-sessions` - List study sessions
- `POST /api/study-sessions` - Create study session
- `GET /api/daily-goals/:date` - Get daily goal
- `POST /api/daily-goals` - Create daily goal
- `GET /api/todos` - List todos
- `POST /api/todos` - Create todo
- `GET /api/analytics/summary` - Get analytics data
- `GET /api/dashboard/stats` - Get dashboard statistics

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the GitHub repository.