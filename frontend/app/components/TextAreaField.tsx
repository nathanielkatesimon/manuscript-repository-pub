import React from "react";

interface TextAreaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  required?: boolean;
  hint?: string;
}

export default function TextAreaField({ label, id, required, hint, ...props }: TextAreaFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={fieldId} className="text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>
      <textarea
        id={fieldId}
        className="w-full rounded-md border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary-tint focus:bg-white focus:outline-none transition-colors resize-none"
        {...props}
      />
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
