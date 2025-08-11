import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
  title?: string;
  message?: string;
  showDetails?: boolean;
}

export const ErrorFallback = ({ 
  error, 
  resetErrorBoundary,
  title = "Something went wrong",
  message = "We're sorry, but something unexpected happened. Please try refreshing the page or go back to the home page.",
  showDetails = process.env.NODE_ENV === 'development'
}: ErrorFallbackProps) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-[#57BBB6]/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-[#376F6B]">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-[#57BBB6]">
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </p>
          
          {showDetails && error && (
            <details className="text-left bg-[#57BBB6]/10 p-3 rounded text-sm">
              <summary className="cursor-pointer font-medium mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-xs overflow-auto">
                {error.message}
                {error.stack && (
                  <div className="mt-2 text-[#57BBB6]">
                    {error.stack}
                  </div>
                )}
              </pre>
            </details>
          )}
          
          <div className="flex gap-3 justify-center">
            {resetErrorBoundary && (
              <Button 
                onClick={resetErrorBoundary}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button 
              onClick={handleReload}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
            <Button 
              onClick={handleGoHome}
              variant="outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorFallback; 