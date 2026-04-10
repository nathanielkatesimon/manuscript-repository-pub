import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
}

export default function SelectField({
  label,
  id,
  options,
  placeholder,
  required,
  value,
  ...props
}: SelectFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const isControlled = value !== undefined;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>
      <div className="relative">
        <select
          id={fieldId}
          className="w-full appearance-none rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 focus:border-primary-tint focus:bg-white focus:outline-none transition-colors cursor-pointer"
          {...(isControlled ? { value } : { defaultValue: "" })}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom chevron */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </div>
  );
}