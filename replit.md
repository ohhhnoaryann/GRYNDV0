# Grynd - JEE Study Planner Application

## Overview

Grynd is a comprehensive study planner application designed specifically for JEE (Joint Entrance Examination) preparation. It provides students with tools to track study sessions, manage goals, organize tasks, and analyze their study patterns through detailed analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for data visualization

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Storage**: PostgreSQL-based session storage with connect-pg-simple

### Database Schema Design
The application uses a relational database design with the following core entities:
- **Users**: Basic user authentication and profile management
- **Subjects**: Study subjects with customizable colors
- **Study Sessions**: Time tracking with subject association and notes
- **Daily Goals**: Target minutes per day with completion tracking
- **Todos**: Task management organized by subject with due dates
- **Playlists**: YouTube/study material links organized by subject
- **Settings**: User preferences and configuration

## Key Components

### Timer System
- **Pause/Resume Functionality**: Users can pause and resume study sessions
- **Session Confirmation**: Modal prompt for subject selection and note-taking when stopping timer
- **Real-time Updates**: Automatic refresh of dashboard statistics

### Analytics Dashboard
- **Visual Data Representation**: Pie charts showing time distribution across subjects
- **Time Aggregation**: Total study time calculated per subject from session data
- **Interactive Tooltips**: Detailed breakdowns with percentages and hours

### Goals and Streaks
- **Daily Goal Setting**: Users can set and modify daily study time targets
- **Progress Tracking**: Visual progress bars showing completion towards daily goals
- **Streak Calculation**: Automatic tracking of consecutive days meeting goals

### Task Management
- **Subject-based Organization**: Tasks grouped and filtered by subject
- **Due Date Management**: Optional due dates with sorting capabilities
- **Status Tracking**: Pending/completed states with visual indicators

### Smart Suggestions
- **Usage Analysis**: Identifies subjects with less than 20% of weekly study time
- **Proactive Recommendations**: Suggests focus areas based on study patterns
- **Dismissible Notifications**: Non-intrusive suggestion system

## Data Flow

### Study Session Flow
1. User starts timer and selects subject
2. Timer runs with pause/resume capability
3. On stop, user confirms subject and adds optional notes
4. Session data persists to database
5. Dashboard statistics update automatically
6. Daily goal progress recalculates

### Analytics Flow
1. Backend aggregates session data by subject
2. Frontend queries analytics endpoint
3. Data transforms for chart visualization
4. Interactive charts render with real-time tooltips

### Goal Tracking Flow
1. User sets daily minute target
2. System tracks completed minutes from sessions
3. Progress bar updates in real-time
4. Streak calculation runs daily based on goal completion

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing
- **recharts**: Chart visualization

### UI Dependencies
- **@radix-ui/***: Accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe CSS variants
- **lucide-react**: Icon library

### Development Tools
- **vite**: Fast build tool and dev server
- **tsx**: TypeScript execution for development
- **esbuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon PostgreSQL with connection pooling
- **Environment Variables**: DATABASE_URL for database connection

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: esbuild bundles Node.js server code
- **Deployment**: Replit hosting platform
- **Database Migrations**: Drizzle Kit for schema management

### Performance Optimizations
- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Vite's built-in optimization
- **Query Caching**: TanStack Query with smart cache invalidation

The application follows modern web development best practices with a focus on type safety, performance, and user experience. The modular architecture allows for easy feature expansion and maintenance.