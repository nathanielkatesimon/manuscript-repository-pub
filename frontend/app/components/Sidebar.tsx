"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { swal } from "@/lib/swal";
import useUserStore from "@/store/userStore";

interface NavItem {
  label: string;
  href: string;
}

interface SidebarProps {
  navItems: NavItem[];
}

export default function Sidebar({ navItems }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const clearUser = useUserStore((state) => state.clearUser);

  const handleLogout = useCallback(async () => {
    const result = await swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, log out",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      clearUser();
      router.push("/login");
    }
  }, [clearUser, router]);

  return (
    <aside className="fixed inset-y-0 left-0 z-10 flex w-60 flex-col scale-x-[105%] bg-gray-50">
      {/* Logo */}
      <div className="flex items-center justify-center p-6">
        <Image
          src="/icon.png"
          alt="Logo"
          width={120}
          height={120}
          className="rounded-full"
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-tint-light text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {isActive && (
                    <span className="text-xs leading-none">▶</span>
                  )}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-red-200 hover:text-red-500 hover:cursor-pointer"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
