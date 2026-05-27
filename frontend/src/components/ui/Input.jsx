import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Input = forwardRef(({ 
  className, 
  error, 
  label, 
  id,
  ...props 
}, ref) => {
  const inputId = id || Math.random().toString(36).substring(7);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          ref={ref}
          className={twMerge(clsx(
            "block w-full rounded-lg border-gray-300 px-4 py-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors",
            error && "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500",
            className
          ))}
          {...props}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 mt-1" id={`${inputId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
