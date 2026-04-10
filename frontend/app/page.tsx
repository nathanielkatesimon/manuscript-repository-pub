"use client"

import { redirect } from "next/navigation";
import useUserStore from "@/store/userStore";

export default function Home() {
  const user = useUserStore((state) => state.user);
  const hasHydrated = useUserStore((state) => state._hasHydrated);

  if (!hasHydrated) {
    return null;
  }

  if (user?.role === "student") {
    redirect("/student/repository");
  } else if (user?.role === "adviser") {
    redirect("/adviser/dashboard");
  } else if (user?.role === "admin") {
    redirect("/admin/dashboard");
  } else {
    redirect("/login");
  }
}
