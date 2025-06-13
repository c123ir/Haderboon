import express from 'express';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create Express application instance
const app = express();

// Define PORT constant with fallback to 5550
const PORT = process.env.PORT || 5550;

// Middleware for parsing JSON
app.use(express.json());

// GET endpoint for root path
app.get('/', (req, res) => {
  res.json({ message: "Welcome to Haderboon AI Assistant API" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
