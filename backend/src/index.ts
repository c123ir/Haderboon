import express from 'express';
import dotenv from 'dotenv';
import { apiRouter } from './api';

// Load environment variables from .env file
dotenv.config();

// Create Express application instance
const app = express();

// Define PORT constant with fallback to 5550
const PORT = process.env.PORT || 5550;

// Middleware for parsing JSON
app.use(express.json());

// Use API router for all routes prefixed with /api
app.use('/api', apiRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
