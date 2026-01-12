import React from 'react';

const Loading = ({
  size = 'md',
  color = 'indigo',
  className = '',
  text = '',
  fullScreen = false,
  ...props
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colors = {
    indigo: 'text-indigo-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    red: 'text-red-600',
    gray: 'text-gray-600'
  };

  const sizeClass = sizes[size] || sizes.md;
  const colorClass = colors[color] || colors.indigo;

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`} {...props}>
      <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-current ${sizeClass} ${colorClass}`}></div>
      {text && (
        <p className="mt-2 text-sm text-gray-600">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Skeleton loading component for content
export const Skeleton = ({
  className = '',
  lines = 3,
  ...props
}) => {
  return (
    <div className={`animate-pulse ${className}`} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`h-4 bg-gray-200 rounded mb-2 ${index === lines - 1 ? 'w-3/4' : 'w-full'}`}
        ></div>
      ))}
    </div>
  );
};

// Card skeleton for loading states
export const CardSkeleton = ({
  className = '',
  ...props
}) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-4 animate-pulse ${className}`} {...props}>
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;