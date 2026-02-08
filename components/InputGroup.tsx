import React from 'react';

interface InputGroupProps {
  label: string;
  children: React.ReactNode;
  error?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, children, error }) => {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};