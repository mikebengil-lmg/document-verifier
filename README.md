# 📄 Document Verifier UI

A simple React + Vite + Tailwind CSS + Radix UI interface for uploading and validating identity documents using an AI-powered backend.

## ⚙️ Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/mikebengil-lmg/document-verifier.git
   cd document-verifier
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Start the development server on port `5050`:
   ```bash
   yarn dev
   ```

## 🚀 Features

- Upload multiple identity documents
- Provide Family ID
- Sends files to a .NET proxy that relays to a Python AI validator
- Displays validation results including:
  - Fraud risk level
  - File-specific notes
  - Summary
  - 📚 Document Storyline tab for narrative context

## 🔍 Testing Endpoints

- **Classification (Test Mode):**  
  `POST http://localhost:8383/api/v1/smart_document_classify_test`  
  Accepts file uploads (not base64)

- **Validation (Batch):**  
  `POST http://localhost:8383/api/v1/validate_batch`  
  Accepts structured document payload + clients + enum_filetypes

## 🧪 Sample Payload for Validation

_(See full example in backend README or test file)_

## 📁 Tech Stack

- React + Vite
- Tailwind CSS
- Radix UI + Lucide React for UI components/icons
- react-dropzone for drag-and-drop file upload
- react-hook-form + zod for form validation
- .NET Proxy API
- FastAPI (Python) AI Validator
