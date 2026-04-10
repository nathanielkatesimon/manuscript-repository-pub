"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useUserStore, { type User } from "@/store/userStore";

interface RouteGuardProps {
  allowedRole: User["role"];
  children: React.ReactNode;
}

export default function RouteGuard({ allowedRole, children }: RouteGuardProps) {
  const user = useUserStore((state) => state.user);
  const hasHydrated = useUserStore((state) => state._hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role !== allowedRole) {
      router.replace("/not-found");
    }
  }, [user, allowedRole, router, hasHydrated]);

  if (!hasHydrated || !user || user.role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}
