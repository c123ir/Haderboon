import { Request, Response } from 'express';

// User registration controller
export const registerUser = async (req: Request, res: Response) => {
  try {
    // Extract email, password, and name from request body
    const { email, password, name } = req.body;

    // Basic validation - check if required fields are present
    if (!email || !password || !name) {
      return res.status(400).json({ 
        error: "Email, password, and name are required." 
      });
    }

    // For now, just return success message without database interaction
    return res.status(201).json({
      message: "User registered successfully",
      user: {
        email: email,
        name: name
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      error: "Internal server error" 
    });
  }
}; 