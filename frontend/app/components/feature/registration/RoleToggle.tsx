import React from "react";

export type Role = "student" | "adviser";

interface RoleToggleProps {
  value: Role;
  onChange: (role: Role) => void;
}

const ROLES: { key: Role; label: string }[] = [
  { key: "student", label: "Student" },
  { key: "adviser", label: "Adviser" },
];

export default function RoleToggle({ value, onChange }: RoleToggleProps) {
  return (
    <div className="flex gap-3">
      {ROLES.map(({ key, label }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`rounded-full px-8 py-2.5 text-sm font-semibold transition-all duration-200 border-2 ${
              active
                ? "bg-primary-tint text-white border-primary-tint shadow-sm"
                : "bg-white text-primary-tint border-primary-tint hover:bg-primary-tint-light hover:border-primary-tint-light hover:cursor-pointer"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}