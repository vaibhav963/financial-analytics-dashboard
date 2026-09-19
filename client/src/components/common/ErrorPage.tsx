import React, { useState } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  Home,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  FileQuestion,
  WifiOff,
  LifeBuoy,
} from 'lucide-react';
import { Button } from './Button.js';

export interface ErrorPageProps {
  statusCode?: 404 | 500 | 403 | 503 | number;
  title?: string;
  message?: string;
  error?: Error | null;
  errorInfo?: React.ErrorInfo | null;
  onRetry?: () => void;
  onReset?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  statusCode = 500,
  title,
  message,
  error,
  errorInfo,
  onRetry,
  onReset,
}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Generate deterministic/unique incident correlation ID
  const [incidentId] = useState<string>(() => {
    return 'ERR-' + Math.random().toString(36).substring(2, 9).toUpperCase();
  });

  const getStatusConfig = () => {
    switch (statusCode) {
      case 400:
        return {
          badge: '400 - Invalid Request',
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
          defaultTitle: 'Malformed Query Parameters',
          defaultMessage:
            'The requested financial query contains invalid filtering bounds or malformed request parameters.',
          icon: <AlertTriangle className="w-10 h-10 text-amber-600" />,
          glowColor: 'from-amber-500/10 to-transparent',
        };
      case 401:
        return {
          badge: '401 - Session Expired',
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
          defaultTitle: 'Authentication Required',
          defaultMessage:
            'Your secure workspace session has expired or is invalid. Please sign in to continue accessing analytics data.',
          icon: <ShieldAlert className="w-10 h-10 text-blue-600" />,
          glowColor: 'from-blue-500/10 to-transparent',
        };
      case 404:
        return {
          badge: '404 - Page Not Found',
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
          defaultTitle: 'Requested Resource Not Found',
          defaultMessage:
            'The dashboard view, transaction record, or endpoint you are trying to access does not exist or has been relocated.',
          icon: <FileQuestion className="w-10 h-10 text-amber-600" />,
          glowColor: 'from-amber-500/10 to-transparent',
        };
      case 403:
        return {
          badge: '403 - Access Restricted',
          badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
          defaultTitle: 'Access Permissions Required',
          defaultMessage:
            'Your current analyst profile does not have sufficient role privileges to perform this operation. Please contact your workspace administrator.',
          icon: <ShieldAlert className="w-10 h-10 text-rose-600" />,
          glowColor: 'from-rose-500/10 to-transparent',
        };
      case 502:
      case 503:
        return {
          badge: `${statusCode} - Service Unavailable`,
          badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
          defaultTitle: 'Platform Temporarily Offline',
          defaultMessage:
            'The financial analytics aggregation engine is currently undergoing maintenance or high load. Please check back shortly.',
          icon: <WifiOff className="w-10 h-10 text-purple-600" />,
          glowColor: 'from-purple-500/10 to-transparent',
        };
      case 500:
      default:
        return {
          badge: '500 - Application Exception',
          badgeColor: 'bg-red-50 text-red-700 border-red-200',
          defaultTitle: 'Unexpected System Error',
          defaultMessage:
            'An unexpected application state occurred while processing this financial workspace. The error has been captured and isolated.',
          icon: <AlertTriangle className="w-10 h-10 text-red-600" />,
          glowColor: 'from-red-500/10 to-transparent',
        };
    }
  };

  const config = getStatusConfig();
  const displayTitle = title || config.defaultTitle;
  const displayMessage = message || config.defaultMessage;

  const handleCopyDiagnostics = async () => {
    const diagnosticData = {
      incidentId,
      statusCode,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorMessage: error?.message || 'N/A',
      errorStack: error?.stack || 'N/A',
      componentStack: errorInfo?.componentStack || 'N/A',
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(diagnosticData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  const handleReload = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    if (onReset) {
      onReset();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] flex items-center justify-center p-4 sm:p-6 select-none">
      {/* Decorative background glow circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-loopr-400/15 to-purple-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-2xl bg-white border border-slateNavy-200/90 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slateNavy-900/5 overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-loopr-600 via-purple-600 to-rose-500" />

        {/* Header Block */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-slateNavy-50 border border-slateNavy-100 shadow-inner">
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${config.glowColor}`} />
            {config.icon}
          </div>

          <div className="space-y-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${config.badgeColor}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {config.badge}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slateNavy-900 font-display tracking-tight">
              {displayTitle}
            </h1>
            <p className="text-sm text-slateNavy-600 max-w-lg leading-relaxed mx-auto">
              {displayMessage}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={handleReload}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            className="w-full sm:w-auto shadow-md"
          >
            Reload Application
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={handleGoHome}
            leftIcon={<Home className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Return to Dashboard
          </Button>

          <Button
            variant="ghost"
            size="md"
            onClick={handleCopyDiagnostics}
            leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slateNavy-500" />}
            className="w-full sm:w-auto text-slateNavy-600 hover:text-slateNavy-900"
          >
            {copied ? 'Copied Diagnostics' : 'Copy Error Details'}
          </Button>
        </div>

        {/* Technical Diagnostics Accordion */}
        {(error || errorInfo) && (
          <div className="mt-8 pt-6 border-t border-slateNavy-100">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slateNavy-500 hover:text-slateNavy-800 transition-colors py-1"
            >
              <span className="flex items-center gap-1.5">
                <LifeBuoy className="w-3.5 h-3.5 text-loopr-600" />
                Technical Incident Trace ({incidentId})
              </span>
              {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showDetails && (
              <div className="mt-3 p-4 bg-slateNavy-950 text-slate-200 rounded-2xl text-xs font-mono overflow-x-auto space-y-2 border border-slateNavy-800">
                <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slateNavy-800">
                  <span>Incident ID: {incidentId}</span>
                  <span>{new Date().toISOString()}</span>
                </div>
                {error?.message && (
                  <div>
                    <span className="text-red-400 font-bold">Error:</span> {error.message}
                  </div>
                )}
                {error?.stack && (
                  <div>
                    <span className="text-slate-400 font-semibold">Stack Trace:</span>
                    <pre className="mt-1 text-[11px] text-slate-300 whitespace-pre-wrap max-h-44 overflow-y-auto leading-relaxed">
                      {error.stack}
                    </pre>
                  </div>
                )}
                {errorInfo?.componentStack && (
                  <div>
                    <span className="text-purple-400 font-semibold">Component Hierarchy:</span>
                    <pre className="mt-1 text-[11px] text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer info metadata */}
        <div className="mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slateNavy-400 border-t border-slateNavy-100/70 gap-2">
          <span>Enterprise Financial Intelligence Platform</span>
          <span className="font-mono">Reference: {incidentId}</span>
        </div>
      </div>
    </div>
  );
};
