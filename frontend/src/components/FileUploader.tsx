import React, { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle, X } from "lucide-react";
import { Button } from "./Button";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  allowedTypes?: string[];
  maxSizeMB?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  isLoading = false,
  allowedTypes = [".pdf", ".docx", ".txt"],
  maxSizeMB = 5
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    setError(null);
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    
    if (!allowedTypes.includes(ext)) {
      setError(`Invalid file type '${ext}'. Please upload a PDF, DOCX, or TXT document.`);
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds the maximum limit of ${maxSizeMB}MB.`);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        accept={allowedTypes.join(",")}
        onChange={handleChange}
        className="hidden"
      />

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          dragActive
            ? "border-electric-500 bg-electric-500/10 shadow-glow"
            : selectedFile
            ? "border-emerald-500/50 bg-emerald-500/5"
            : "border-slate-700 hover:border-electric-500/60 bg-navy-950/60 hover:bg-navy-900/60"
        }`}
      >
        {selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400 mb-3">
              <CheckCircle className="w-8 h-8" />
            </div>
            <p className="text-base font-semibold text-white">{selectedFile.name}</p>
            <p className="text-xs text-slate-400 mt-1">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for parsing
            </p>
            <div className="flex items-center gap-3 mt-4" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                <X className="w-3.5 h-3.5 mr-1" />
                Change File
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="p-4 bg-electric-500/10 rounded-2xl text-electric-400 mb-3 border border-electric-500/20">
              <Upload className="w-8 h-8" />
            </div>
            <h4 className="text-base font-semibold text-white">
              Drag & drop your resume file here
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Supports <span className="text-electric-400 font-medium">PDF, DOCX, or TXT</span> files up to {maxSizeMB}MB.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              isLoading={isLoading}
            >
              Browse Files
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center text-rose-400 text-xs font-medium mt-2 px-1">
          <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};
