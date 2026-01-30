
import React from 'react';

interface BrutalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export const BrutalButton: React.FC<BrutalButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "text-xl font-bold px-8 py-4 brutalist-border brutalist-shadow brutalist-shadow-hover transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none uppercase tracking-tighter";
  
  const variants = {
    primary: "bg-black text-white hover:bg-white hover:text-black",
    secondary: "bg-yellow-300 text-black",
    danger: "bg-red-500 text-white"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
