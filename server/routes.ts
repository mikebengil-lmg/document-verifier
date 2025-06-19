import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { uploadRequestSchema } from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Document validation endpoint
  app.post('/api/validate-docs', upload.array('files'), async (req, res) => {
    try {
      console.log('Received validation request');
      console.log('Body:', req.body);
      console.log('Files:', req.files);

      // Validate request body
      const { familyId } = uploadRequestSchema.parse(req.body);
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return res.status(400).json({ message: 'No files uploaded' });
      }

      // Create FormData for external API call
      const FormData = (await import('form-data')).default;
      const formData = new FormData();
      
      formData.append('familyId', familyId);
      
      // Add each file to form data
      files.forEach(file => {
        formData.append('files', file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype
        });
      });

      // Make API call to validation service
      const response = await fetch('http://localhost:5000/hackathon/validate-docs', {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Validation service returned ${response.status}: ${response.statusText}`);
      }

      const validationResult = await response.json();
      console.log('Validation result:', validationResult);

      res.json(validationResult);
    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
