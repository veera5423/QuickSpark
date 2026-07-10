import React from 'react';

const Card = ({
  children,
  className = '',
  padding = 'default',
  shadow = 'md',
  rounded = 'lg',
  border = false,
  hover = false,
  ...props
}) => {
  const baseClasses = 'bg-white transition-all duration-200';

  const paddings = {
    none: 'p-0',
    sm: 'p-3',
    default: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  const shadows = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const roundeds = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl'
  };

  const paddingClass = paddings[padding] || paddings.default;
  const shadowClass = shadows[shadow] || shadows.md;
  const roundedClass = roundeds[rounded] || roundeds.lg;

  const borderClass = border ? 'border border-slate-200' : '';
  const hoverClass = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';

  return (
    <div
      className={`${baseClasses} ${paddingClass} ${shadowClass} ${roundedClass} ${borderClass} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
