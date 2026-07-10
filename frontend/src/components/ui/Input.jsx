import React from 'react';

const Input = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  label,
  required,
  icon: Icon,
  name,
  id,
  ...rest
}) => {
  const inputId = id || name;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-slate-400" />
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${className}`}
          {...rest}
        />
      </div>
    </div>
  );
};

export default Input;
