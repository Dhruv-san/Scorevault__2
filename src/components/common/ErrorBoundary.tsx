import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled Scorevault UI error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md shadow-xl">
            <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-900 font-display">Something went wrong</h2>
            <p className="text-xs text-slate-600 mt-2 mb-6 leading-relaxed">
              Scorevault encountered an unexpected error. Don't worry, your data is safe.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Scorevault</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
