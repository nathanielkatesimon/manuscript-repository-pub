"use client"

import Image from "next/image";
import Link from "next/link";
import useUserStore from "@/store/userStore";
import React from "react";
import NotificationBell from "@/app/components/NotificationBell";

export default function StudentTopbar({ title, children }: { title?: string, children?: React.ReactNode }) {
  const { user } = useUserStore();
  
  return (
    <header className="bg-primary z-10 px-6 rounded-bl-2xl w-full">
      <nav className="top-0 flex h-16 items-center">
        <h1 className="text-2xl font-bold pi0">{title}</h1>
        
        <div className="ml-auto flex items-center gap-4">
          {/* New upload button */}
          {user?.role === "student" && <>          
            <Link
              href="/student/new_upload"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg font-light text-primary transition-colors hover:cursor-pointer"
              aria-label="New upload"
            >
              +
            </Link>
            <NotificationBell />
            {/* Divider */}
            <div className="h-6 w-px bg-gray-200" aria-hidden="true" />
          </>
          }
  
  
          {/* User info */}
          <div className="flex items-center gap-3">
            <span className="text-right text-sm font-medium leading-tight text-white">
              {user?.first_name} {user?.middle_name}
              <br />
              {user?.last_name}
            </span>
            <div className="h-9 w-9 overflow-hidden rounded-full">
              <Image
                src={user?.avatar_url ? `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"}${user.avatar_url}` : "/avatar_placeholder.png"}
                alt="Avatar"
                width={36}
                height={36}
                unoptimized
              />
            </div>
          </div>
        </div>      
      </nav>
      {children && 
        <div className="pb-8">
          {children}
        </div>
      }
    </header>
  );
}
