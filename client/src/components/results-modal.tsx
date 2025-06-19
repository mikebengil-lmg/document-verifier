import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  Lightbulb,
  Info,
  X,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { ValidationResult, DocumentValidation } from "@shared/schema";

interface ResultsModalProps {
  open: boolean;
  onClose: () => void;
  results: ValidationResult | null;
  onUploadMore: () => void;
}

export default function ResultsModal({
  open,
  onClose,
  results,
  onUploadMore,
}: ResultsModalProps) {
  const [selectedDocuments, setSelectedDocuments] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    if (results?.aiValidationResult?.validations) {
      // Pre-select documents that are not high risk or explicitly rejected
      const preSelected = new Set<number>();
      results.aiValidationResult.validations.forEach((doc, index) => {
        if (
          doc.fraud_risk !== "high" &&
          !doc.status.toLowerCase().includes("review")
        ) {
          preSelected.add(index);
        }
      });
      setSelectedDocuments(preSelected);
    }
  }, [results]);

  const toggleDocument = (index: number) => {
    setSelectedDocuments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string, fraudRisk: string) => {
    if (status.toLowerCase().includes("warning") || fraudRisk === "medium") {
      return <AlertTriangle className="h-4 w-4 mr-1" />;
    }
    if (status.toLowerCase().includes("review") || fraudRisk === "high") {
      return <Ban className="h-4 w-4 mr-1" />;
    }
    return <CheckCircle className="h-4 w-4 mr-1" />;
  };

  const getStatusBadge = (status: string, fraudRisk: string) => {
    if (status.toLowerCase().includes("warning") || fraudRisk === "medium") {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          {getStatusIcon(status, fraudRisk)}
          Warning
        </Badge>
      );
    }
    if (status.toLowerCase().includes("review") || fraudRisk === "high") {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          {getStatusIcon(status, fraudRisk)}
          Please Review
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-green-100 text-green-800">
        {getStatusIcon(status, fraudRisk)}
        Valid
      </Badge>
    );
  };

  const getFraudRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "high":
        return "text-error";
      case "medium":
        return "text-warning";
      case "low":
        return "text-success";
      default:
        return "text-gray-600";
    }
  };

  const handleProceed = () => {
    // Handle proceeding with selected files
    console.log("Proceeding with documents:", Array.from(selectedDocuments));
    onClose();
  };

  if (!results) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Validation Results
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Section */}
          <Tabs defaultValue="summary" className="w-full">
            <TabsList>
              <TabsTrigger value="summary">Validation Summary</TabsTrigger>
              <TabsTrigger value="storyline">Document Storyline</TabsTrigger>
            </TabsList>
            <TabsContent value="summary">
              <Card className="bg-gray-50 p-4 mt-2">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Validation Summary
                </h4>
                <p className="text-gray-700">
                  {results.aiValidationResult.summary}
                </p>
              </Card>
            </TabsContent>
            <TabsContent value="storyline">
              <Card className="bg-gray-50 p-4 mt-2">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Inferred Storyline
                </h4>
                <p className="text-gray-700 whitespace-pre-line">
                  {results.aiValidationResult.storyline ||
                    "No storyline available."}
                </p>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Document Validations */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Document Validation Results
            </h4>
            <div className="space-y-4">
              {results.aiValidationResult.validations.map((doc, index) => (
                <Card key={index} className="border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`doc_${index}`}
                        checked={selectedDocuments.has(index)}
                        onCheckedChange={() => toggleDocument(index)}
                        className="w-5 h-5"
                      />
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {doc.file_name}
                        </h5>
                        {getStatusBadge(doc.status, doc.fraud_risk)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Document Type</div>
                      <div className="font-medium text-gray-900">
                        {doc.matched_type.replace(/([A-Z])/g, " $1").trim()}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-2">
                        Validation Details
                      </h6>
                      <p className="text-sm text-gray-600">{doc.reason}</p>
                    </div>
                    <div>
                      <h6 className="text-sm font-medium text-gray-700 mb-2">
                        Fraud Risk:{" "}
                        <span
                          className={`capitalize ${getFraudRiskColor(
                            doc.fraud_risk
                          )}`}
                        >
                          {doc.fraud_risk}
                        </span>
                      </h6>
                      <p className="text-sm text-gray-600">{doc.fraud_notes}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Unclassified Files */}
          {results.unclassifiedFiles.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Unclassified Files
              </h4>
              <Card className="bg-gray-50 p-4">
                <p className="text-sm text-gray-600 mb-3">
                  The following files could not be classified and will not be
                  uploaded:
                </p>
                <div className="space-y-2">
                  {results.unclassifiedFiles.map((fileName, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <X className="h-4 w-4 text-red-500" />
                      {fileName}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Suggestions */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Suggested Additional Documents
            </h4>
            <Card className="bg-blue-50 p-4">
              <div className="space-y-2 text-sm text-gray-700">
                {results.aiValidationResult.suggestions.map(
                  (suggestion, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {suggestion.includes("(") ? (
                        <Info className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Lightbulb className="h-4 w-4 text-blue-500" />
                      )}
                      <span
                        className={
                          suggestion.includes("(") ? "text-gray-500" : ""
                        }
                      >
                        {suggestion}
                      </span>
                    </div>
                  )
                )}
              </div>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              onClick={handleProceed}
              className="bg-primary hover:bg-blue-700 font-medium"
            >
              Proceed with Selected Files
            </Button>
            <Button
              onClick={onUploadMore}
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
            >
              Upload More Documents
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
