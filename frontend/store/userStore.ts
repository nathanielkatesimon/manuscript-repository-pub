/**
 * useUserStore — global store for the currently authenticated user.
 *
 * Usage:
 *
 *   import useUserStore from "@/store/userStore";
 *
 *   // Read state
 *   const { user, token } = useUserStore();
 *
 *   // After a successful login or registration:
 *   useUserStore.getState().setUser(responseData, responseToken);
 *
 *   // On logout:
 *   useUserStore.getState().clearUser();
 *
 * The `user` object is a discriminated union — narrow it via the `role` field:
 *
 *   if (user?.role === "student") {
 *     console.log(user.program_or_track, user.year_level);
 *   } else if (user?.role === "adviser") {
 *     console.log(user.department);
 *   }
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BaseUser {
  id: number;
  auth_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  role: "student" | "adviser" | "admin";
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentUser extends BaseUser {
  role: "student";
  program_or_track: string;
  year_level: string;
}

export interface AdviserUser extends BaseUser {
  role: "adviser";
  department: string;
}

export interface AdminUser extends BaseUser {
  role: "admin";
}

export type User = StudentUser | AdviserUser | AdminUser;

interface UserStore {
  user: User | null;
  token: string | null;
  _hasHydrated: boolean;
  setUser: (user: User, token: string) => void;
  updateUser: (user: User) => void;
  clearUser: () => void;
  setHasHydrated: (state: boolean) => void;
}

const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      _hasHydrated: false,
      setUser: (user, token) => set({ user, token }),
      updateUser: (user) => set({ user }),
      clearUser: () => set({ user: null, token: null }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "user-storage",
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useUserStore;
