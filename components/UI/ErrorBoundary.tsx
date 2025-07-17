'use client';

import React from 'react';
import { Alert, Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle, IconRefresh, IconHome } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  retry: () => void;
}

// Default error fallback component
function DefaultErrorFallback({ error, retry }: ErrorFallbackProps) {
  const router = useRouter();

  const goHome = () => {
    router.push('/');
  };

  const isNetworkError = error.message.includes('fetch') || 
                        error.message.includes('network') ||
                        error.message.includes('Failed to load');

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <Container size="md" py="xl">
      <Stack align="center" gap="xl">
        <IconAlertTriangle size={64} color="var(--mantine-color-red-6)" />
        
        <Stack align="center" gap="md">
          <Title order={2} ta="center">
            Oops! Something went wrong
          </Title>
          
          <Text size="lg" c="dimmed" ta="center" maw={600}>
            {isNetworkError 
              ? "We're having trouble connecting to our servers. Please check your internet connection and try again."
              : "We encountered an unexpected error while loading your Pokédex. Don't worry, your data is safe!"
            }
          </Text>
        </Stack>

        {/* Development error details */}
        {isDevelopment && (
          <Alert 
            variant="light" 
            color="red" 
            title="Development Error Details"
            icon={<IconAlertTriangle />}
            w="100%"
          >
            <Stack gap="xs">
              <Text fw={600}>Error:</Text>
              <Text size="sm" ff="monospace" style={{ wordBreak: 'break-word' }}>
                {error.message}
              </Text>
              {error.stack && (
                <>
                  <Text fw={600} mt="md">Stack Trace:</Text>
                  <Text 
                    size="xs" 
                    ff="monospace" 
                    style={{ 
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      maxHeight: 200,
                      overflow: 'auto'
                    }}
                  >
                    {error.stack}
                  </Text>
                </>
              )}
            </Stack>
          </Alert>
        )}

        {/* Action buttons */}
        <Group>
          <Button 
            leftSection={<IconRefresh size={16} />}
            onClick={retry}
            size="md"
          >
            Try Again
          </Button>
          
          <Button 
            variant="light"
            leftSection={<IconHome size={16} />}
            onClick={goHome}
            size="md"
          >
            Go Home
          </Button>
        </Group>

        {/* Help text */}
        <Text size="sm" c="dimmed" ta="center">
          If this problem persists, try refreshing the page or clearing your browser cache.
        </Text>
      </Stack>
    </Container>
  );
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    // Example: Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // sendErrorToService(error, errorInfo);
    }
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided, otherwise use default
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent 
          error={this.state.error} 
          retry={this.retry}
        />
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to trigger error boundaries
export function useErrorHandler() {
  return (error: Error) => {
    throw error;
  };
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
} 