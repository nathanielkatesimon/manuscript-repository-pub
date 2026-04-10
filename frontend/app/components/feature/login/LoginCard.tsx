import Image from "next/image";
import Link from "next/link";
import PasswordField from "@/app/components/PasswordField";
import InputField from "@/app/components/InputField";

interface LoginCardProps {
  title: string;
  identifierLabel: string;
  identifierPlaceholder: string;
  authId: string;
  onAuthIdChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  password: string;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function LoginCard({
  title,
  identifierLabel,
  identifierPlaceholder,
  authId,
  onAuthIdChange,
  password,
  onPasswordChange,
  isSubmitting,
  onSubmit,
}: LoginCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg px-8 py-8 w-full max-w-sm flex flex-col items-center gap-4">
      {/* Logo */}
      <Image
        src="/icon.png"
        alt="ACLC College of Ormoc"
        width={100}
        height={100}
        className="rounded-full object-cover"
      />

      {/* School name + form title */}
      <div className="text-center">
        <p className="text-sm text-gray-600">ACLC College of Ormoc</p>
        <h2 className="text-lg font-extrabold tracking-wide text-gray-700 uppercase mt-0.5">
          {title}
        </h2>
      </div>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        className="w-full flex flex-col gap-3"
      >
        <InputField
          label=""
          placeholder={identifierPlaceholder}
          aria-label={identifierLabel}
          autoComplete="username"
          value={authId}
          onChange={onAuthIdChange}
        />
        <PasswordField
          label=""
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={onPasswordChange}
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 w-full rounded-lg bg-primary py-3 text-sm font-bold text-white hover:opacity-95 hover:cursor-pointer active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <Link
        href="/forgot-password"
        className="text-xs text-primary opacity-50 hover:opacity-100 transition-colors"
      >
        Forget password?
      </Link>
    </div>
  );
}