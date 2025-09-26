import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dashboard';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  onClick
}) => {
  const baseClasses = 'bg-white rounded-xl border border-gray-100';
  
  const variantClasses = {
    default: 'shadow-lg p-6',
    dashboard: 'shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer'
  };

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
