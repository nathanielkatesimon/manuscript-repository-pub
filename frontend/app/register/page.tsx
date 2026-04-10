"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { swal } from "@/lib/swal";

import FormCard from "@/app/components/feature/registration/FormCard";
import InputField from "@/app/components/InputField";
import PasswordField from "@/app/components/PasswordField";
import SelectField from "@/app/components/SelectField";
import RoleToggle, { Role } from "@/app/components/feature/registration/RoleToggle";
import { DEPARTMENTS } from "@/lib/departments";
import { useYearLevelAndCourse } from "@/hooks/useYearLevelAndCourse";
import useUserStore from "@/store/userStore";

// ─── Static option sets ──────────────────────────────────────────────────────

const DEPARTMENT_OPTIONS = DEPARTMENTS.map((dept) => ({
  value: dept.toLowerCase().replace(/\s+/g, "_"),
  label: dept,
}));

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

// ─── Page ────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const [role, setRole] = useState<Role>("student");
  const [noMiddleName, setNoMiddleName] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [authId, setAuthId] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [user, router]);

  const {
    yearLevel,
    course,
    setYearLevel,
    setCourse,
    yearLevelOptions,
    courseOptions,
  } = useYearLevelAndCourse();

  const yearLevelSelectOptions = useMemo(
    () => yearLevelOptions.map((yl) => ({ value: yl.id, label: yl.label })),
    [yearLevelOptions],
  );

  const courseSelectOptions = useMemo(
    () => courseOptions.map((c) => ({ value: c.id, label: c.label })),
    [courseOptions],
  );

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    setAuthId("");
    setEmail("");
    setDepartment("");
    setYearLevel(null);
    setCourse(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let url: string;
      let body: Record<string, unknown>;

      if (role === "student") {
        url = `${API_BASE_URL}/api/v1/students/registration`;
        body = {
          student: {
            auth_id: authId,
            first_name: firstName,
            middle_name: noMiddleName ? "" : middleName,
            last_name: lastName,
            email,
            password,
            password_confirmation: passwordConfirmation,
            program_or_track: course?.label ?? "",
            year_level: yearLevel?.label ?? "",
          },
        };
      } else {
        url = `${API_BASE_URL}/api/v1/advisers/registration`;
        body = {
          adviser: {
            auth_id: authId,
            first_name: firstName,
            middle_name: noMiddleName ? "" : middleName,
            last_name: lastName,
            email,
            password,
            password_confirmation: passwordConfirmation,
            department,
          },
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        useUserStore.getState().setUser(data.data, data.token);
        await swal.success(
          "Registration Successful!",
          `Welcome, ${data.data?.first_name ?? ""}! Your account has been created.`,
        );
      } else {
        const errors: string[] = data.errors ?? ["Registration failed. Please try again."];
        await swal.error("Registration Failed", errors.join("\n"));
      }
    } catch {
      await swal.connectionError();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-200 flex flex-col items-center justify-center px-4 py-12">
      {/* Top-right link */}
      <div className="w-full max-w-4xl flex justify-end mb-4">
        <Link
          href="/login"
          className="text-sm font-medium text-primary underline underline-offset-2 hover:opacity-70 transition-opacity"
        >
          I already have an account?
        </Link>
      </div>

      <FormCard>
        {/* ── Heading ──────────────────────────────────────────────── */}
        <h1 className="text-4xl font-extrabold mb-6 tracking-tight text-black">
          Create{" "}
          <span className="font-extrabold text-primary-tint">Account</span>
        </h1>

        {/* ── Two-column form ──────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
            {/* Left column — shared name fields */}
            <div className="flex flex-col gap-5">

              {/* ── Role toggle ──────────────────────────────────────────── */}
              <div className="mb-8">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Please choose your role:
                </p>
                <RoleToggle value={role} onChange={handleRoleChange} />
              </div>

              <InputField
                label="First Name"
                placeholder="First Name"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />

              {/* Middle name + checkbox */}
              <div className="flex flex-col gap-1">
                <InputField
                  label="Middle Name"
                  placeholder="Middle Name"
                  autoComplete="additional-name"
                  disabled={noMiddleName}
                  value={noMiddleName ? "" : middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
                <label className="flex items-center gap-2 mt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={noMiddleName}
                    onChange={(e) => {
                      setNoMiddleName(e.target.checked);
                      if (e.target.checked) setMiddleName("");
                    }}
                    className="h-4 w-4 rounded border-primary accent-primary cursor-pointer"
                  />
                  <span className="text-xs text-gray-500">
                    I have no legal middle name
                  </span>
                </label>
              </div>

              <InputField
                label="Last Name"
                placeholder="Last Name"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {/* Right column — role-specific fields */}
            <div className="flex flex-col gap-5">
              {role === "student" ? (
                <>
                  <InputField
                    label="USN"
                    placeholder="Enter USN"
                    value={authId}
                    onChange={(e) => setAuthId(e.target.value)}
                  />

                  <SelectField
                    label="Year Level"
                    placeholder="Year Level"
                    options={yearLevelSelectOptions}
                    value={yearLevel?.id ?? ""}
                    onChange={(e) => {
                      const selected = yearLevelOptions.find(
                        (yl) => yl.id === e.target.value,
                      );
                      setYearLevel(selected ?? null);
                    }}
                  />

                  <SelectField
                    label="Course/Track"
                    placeholder="Course/Track"
                    options={courseSelectOptions}
                    value={course?.id ?? ""}
                    onChange={(e) => {
                      const selected = courseOptions.find(
                        (c) => c.id === e.target.value,
                      );
                      setCourse(selected ?? null);
                    }}
                  />
                </>
              ) : (
                <>
                  <InputField
                    label="Employee ID"
                    placeholder="Enter Employee ID"
                    value={authId}
                    onChange={(e) => setAuthId(e.target.value)}
                  />

                  <SelectField
                    label="Department"
                    placeholder="Department"
                    options={DEPARTMENT_OPTIONS}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </>
              )}

              <InputField
                label="Email"
                placeholder="Email Address"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <PasswordField
                label="Create Password"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <PasswordField
                label="Re-enter Password"
                placeholder="Re-enter Password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full rounded-lg bg-primary py-3 text-sm font-bold text-white hover:opacity-95 hover:cursor-pointer active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
        </form>
      </FormCard>
    </main>
  );
}
