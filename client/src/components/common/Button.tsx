import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  let variantClasses = '';

  switch (variant) {
    case 'primary':
      variantClasses =
        'bg-loopr-600 hover:bg-loopr-700 text-white shadow-sm hover:shadow active:bg-loopr-800 border border-transparent';
      break;
    case 'secondary':
      variantClasses =
        'bg-slateNavy-100 hover:bg-slateNavy-200 text-slateNavy-800 border border-slateNavy-200';
      break;
    case 'outline':
      variantClasses =
        'bg-white hover:bg-slateNavy-50 text-slateNavy-700 border border-slateNavy-300 hover:border-slateNavy-400';
      break;
    case 'ghost':
      variantClasses =
        'bg-transparent hover:bg-slateNavy-100/70 text-slateNavy-600 hover:text-slateNavy-900 border border-transparent';
      break;
    case 'danger':
      variantClasses =
        'bg-rose-600 hover:bg-rose-700 text-white border border-transparent shadow-sm';
      break;
    case 'glow':
      variantClasses =
        'bg-gradient-to-r from-loopr-600 via-indigo-600 to-cyan-600 hover:from-loopr-700 hover:to-cyan-700 text-white shadow-glow hover:shadow-lg border border-indigo-400/30';
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5'
      : size === 'lg'
      ? 'px-5 py-2.5 text-base font-semibold rounded-xl gap-2.5'
      : 'px-4 py-2 text-sm font-semibold rounded-xl gap-2';

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
