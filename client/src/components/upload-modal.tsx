import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloudUpload, X, File, Loader2 } from "lucide-react";
import { uploadRequestSchema, type ValidationResult } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (results: ValidationResult) => void;
}

export default function UploadModal({ open, onClose, onSuccess }: UploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(uploadRequestSchema),
    defaultValues: {
      familyId: "",
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: { familyId: string; files: File[] }) => {
      const formData = new FormData();
      formData.append("familyId", data.familyId);
      
      data.files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/validate-docs", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }

      return response.json();
    },
    onSuccess: (results) => {
      toast({
        title: "Success",
        description: "Documents validated successfully",
      });
      onSuccess(results);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/pdf": [".pdf"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    form.reset();
    setSelectedFiles([]);
  };

  const handleClose = () => {
    if (!uploadMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  const onSubmit = (data: { familyId: string }) => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files",
        description: "Please select files to upload",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({
      familyId: data.familyId,
      files: selectedFiles,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Upload Documents</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Family ID Input */}
            <FormField
              control={form.control}
              name="familyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Family ID
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter family ID (e.g., 8480995)"
                      {...field}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-gray-500">
                    Required for document validation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload Zone */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 cursor-pointer ${
                isDragActive
                  ? "border-primary bg-blue-50"
                  : "border-gray-300 hover:border-primary hover:bg-blue-50"
              }`}
            >
              <input {...getInputProps()} />
              <CloudUpload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <div className="mb-4">
                <p className="text-lg font-medium text-gray-700 mb-1">
                  Drag and drop files here
                </p>
                <p className="text-gray-500">or click to browse</p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
              >
                Choose Files
              </Button>
              <p className="text-sm text-gray-500 mt-3">
                Supported formats: JPG, PNG, PDF (Max 10MB each)
              </p>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Selected Files
                </h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <File className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {file.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={uploadMutation.isPending || selectedFiles.length === 0}
                className="flex-1 bg-primary hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Upload & Validate"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={uploadMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
