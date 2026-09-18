import { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorPage } from './ErrorPage.js';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // In production, error logs can be streamed to central telemetry (e.g. Sentry/Datadog)
    console.error('Uncaught Application Exception in ErrorBoundary:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorPage
          statusCode={500}
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          onRetry={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}
