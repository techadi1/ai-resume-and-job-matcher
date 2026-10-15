import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = "Something went wrong",
  message,
  onRetry
}) => {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-lg p-5 text-center max-w-md mx-auto my-6">
      <div className="p-2 bg-rose-100 text-rose-700 rounded-full w-fit mx-auto mb-2.5">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
      <p className="text-xs text-rose-700 mt-1 leading-relaxed">{message}</p>
      {onRetry && (
        <div className="mt-3.5">
          <Button variant="danger" size="sm" onClick={onRetry}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
