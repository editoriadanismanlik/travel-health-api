# Travel Health SaaS Platform

A comprehensive web application for managing travel health brand ambassador programs, focusing on job tracking, task management, and earnings monitoring.

## Features

- Real-time Analytics Dashboard
- Widget Customization System
- Job and Task Management
- User Authentication and Authorization
- Real-time WebSocket Updates
- Comprehensive Testing Suite

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- WebSocket (Socket.IO)
- JWT Authentication
- Redis for Caching

### Frontend
- React with TypeScript
- Material-UI Components
- React Query for Data Fetching
- Recharts for Analytics
- Socket.IO Client
- React Hook Form with Zod

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Redis (optional, for WebSocket scaling)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/travel-health-api.git
cd travel-health-api
```

2. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
```

3. Set up environment variables:
```bash
# In root directory
cp .env.example .env

# In client directory
cd client
cp .env.example .env
```

4. Start the development servers:
```bash
# Start backend (from root directory)
npm run dev

# Start frontend (from client directory)
cd client
npm run dev
```

## Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd client
npm test
```

## Deployment

### Backend (Render)
1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Configure environment variables
4. Deploy

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `cd client && npm install && npm run build`
   - Publish directory: `client/dist`
3. Configure environment variables
4. Deploy

## License

MIT
