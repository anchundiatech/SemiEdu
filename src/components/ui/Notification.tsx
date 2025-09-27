import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface NotificationProps {
  type?: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  onClose?: () => void;
  className?: string;
}

export const Notification: React.FC<NotificationProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className
}) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    warning: 'text-yellow-500'
  };

  const Icon = icons[type];

  return (
    <div className={clsx(
      'p-4 rounded-lg border flex items-start space-x-3',
      colors[type],
      className
    )}>
      <Icon className={clsx('w-5 h-5 mt-0.5', iconColors[type])} />
      <div className="flex-1">
        <h4 className="font-medium">{title}</h4>
        {message && <p className="mt-1 text-sm opacity-90">{message}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
