import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
          <Card className="p-8 max-w-md text-center">
            <h2 className="font-cinzel-decorative text-2xl text-red-500 mb-4">
              Combat Arena Error
            </h2>
            <p className="font-cinzel text-muted-foreground mb-6">
              The 3D combat arena encountered an error. This might be due to WebGL compatibility issues.
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
              className="font-cinzel"
            >
              Reload Game
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}