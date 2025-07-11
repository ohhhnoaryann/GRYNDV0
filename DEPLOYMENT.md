# Deployment Guide for Grynd Study Planner

## Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Environment variables configured

## Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=5000
```

## Database Setup
1. Set up a PostgreSQL database
2. Update the `DATABASE_URL` environment variable
3. Run the database migration:
   ```bash
   npm run db:push
   ```

## Build and Deploy
1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Start the production server:
   ```bash
   npm start
   ```

## Platform-Specific Deployment

### Replit
1. Upload the project files to Replit
2. Set environment variables in Replit Secrets
3. Run the application using the "Start application" workflow

### Render.com
1. Connect your GitHub repository
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add environment variables in Render dashboard

### Railway
1. Connect your GitHub repository
2. Set build command: `npm install && npm run build`
3. Set start command: `npm start`
4. Add environment variables in Railway dashboard

### Vercel
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Add environment variables in Vercel dashboard

## Health Check
After deployment, verify the application is working:

1. Check health endpoint: `GET /api/subjects`
2. Create a test subject via the UI
3. Verify database connection and data persistence

## Troubleshooting
- Ensure PostgreSQL database is accessible
- Check environment variables are set correctly
- Verify Node.js version compatibility
- Check server logs for specific error messages