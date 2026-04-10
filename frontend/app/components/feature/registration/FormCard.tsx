import React from "react";

interface FormCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function FormCard({ children, className = "" }: FormCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-lg w-full max-w-4xl mx-auto px-10 py-12 ${className}`}
    >
      {children}
    </div>
  );
}