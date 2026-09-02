import React from 'react';
import { Loader2, AlertCircle, FileX } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading institutional data...' }) => (
  <div className="py-16 text-center flex flex-col items-center justify-center">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
    <p className="text-sm font-bold text-slate-800">{message}</p>
    <p className="text-xs text-slate-400 mt-1">Cross-referencing Scorevault databases...</p>
  </div>
);

export const EmptyState: React.FC<{
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}> = ({
  title = 'No records found',
  description = 'We could not find any matching institutions or reviews for your current criteria.',
  actionText,
  onAction
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto my-6 shadow-2xs">
    <FileX className="w-10 h-10 text-slate-300 mx-auto mb-3" />
    <h3 className="text-base font-bold text-slate-900 font-display">{title}</h3>
    <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">{description}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
      >
        {actionText}
      </button>
    )}
  </div>
);

export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = ({
  title = 'Connection error',
  message = 'Failed to retrieve data from Scorevault servers. Please check your network.',
  onRetry
}) => (
  <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-6 text-center max-w-md mx-auto my-6">
    <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
    <h3 className="text-sm font-bold text-rose-950 font-display">{title}</h3>
    <p className="text-xs text-rose-700 mt-1 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);
