import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, Plus } from "lucide-react";
import UploadModal from "@/components/upload-modal";
import ResultsModal from "@/components/results-modal";
import type { ValidationResult } from "@shared/schema";

export default function Home() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);

  const handleUploadSuccess = (results: ValidationResult) => {
    setValidationResults(results);
    setShowUploadModal(false);
    setShowResultsModal(true);
  };

  const handleUploadMore = () => {
    setShowResultsModal(false);
    setShowUploadModal(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 font-inter">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <Card className="p-6 mb-6 border border-gray-200 shadow-sm">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Document Validation System
              </h1>
              <p className="text-gray-600">
                Upload and validate identity documents for family verification
              </p>
            </Card>

            {/* Upload Section */}
            <Card className="p-8 text-center border border-gray-200 shadow-sm">
              <div className="mb-6">
                <FileUp className="h-16 w-16 text-primary mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Validate Documents
                </h2>
                <p className="text-gray-600">
                  Click the button below to start uploading documents for validation
                </p>
              </div>

              <Button
                onClick={() => setShowUploadModal(true)}
                className="bg-primary hover:bg-blue-700 font-medium px-8 py-3"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <UploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />

      <ResultsModal
        open={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        results={validationResults}
        onUploadMore={handleUploadMore}
      />
    </>
  );
}
