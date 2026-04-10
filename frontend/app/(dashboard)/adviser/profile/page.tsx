"use client";

import React, { useState } from "react";
import AvatarCropper from "@/app/components/AvatarCropper";
import InputField from "@/app/components/InputField";
import SelectField from "@/app/components/SelectField";
import PasswordField from "@/app/components/PasswordField";
import { swal } from "@/lib/swal";
import useUserStore from "@/store/userStore";
import { AdviserUser } from "@/store/userStore";
import { DEPARTMENTS } from "@/lib/departments";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

const DEPARTMENT_OPTIONS = DEPARTMENTS.map((d) => ({ value: d, label: d }));

export default function AdviserProfilePage() {
  const { user, token, updateUser } = useUserStore();
  const adviser = user as AdviserUser | null;

  const [firstName, setFirstName] = useState(adviser?.first_name ?? "");
  const [middleName, setMiddleName] = useState(adviser?.middle_name ?? "");
  const [lastName, setLastName] = useState(adviser?.last_name ?? "");
  const [email, setEmail] = useState(adviser?.email ?? "");
  const [department, setDepartment] = useState(adviser?.department ?? "");
  const [isSavingInfo, setIsSavingInfo] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [pendingAvatarBlob, setPendingAvatarBlob] = useState<Blob | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  function handleAvatarCropped(blob: Blob) {
    setPendingAvatarBlob(blob);
    setAvatarPreview(URL.createObjectURL(blob));
  }

  async function handleSaveAvatar() {
    if (!pendingAvatarBlob) return;
    setIsSavingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("adviser[avatar]", pendingAvatarBlob, "avatar.jpg");
      const res = await fetch(`${API_BASE_URL}/api/v1/advisers/profile`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.data);
        setPendingAvatarBlob(null);
        setAvatarPreview(null);
        await swal.success("Avatar Updated", "Your profile picture has been updated.");
      } else {
        await swal.error("Update Failed", (data.errors ?? []).join("\n"));
      }
    } catch {
      await swal.connectionError();
    } finally {
      setIsSavingAvatar(false);
    }
  }

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingInfo(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/advisers/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adviser: {
            first_name: firstName,
            middle_name: middleName || null,
            last_name: lastName,
            email,
            department,
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        updateUser(data.data);
        await swal.success("Profile Updated", "Your profile information has been saved.");
      } else {
        await swal.error("Update Failed", (data.errors ?? []).join("\n"));
      }
    } catch {
      await swal.connectionError();
    } finally {
      setIsSavingInfo(false);
    }
  }

  async function handleSavePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword) {
      await swal.error("Missing Field", "Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      await swal.error("Password Mismatch", "New password and confirmation do not match.");
      return;
    }
    setIsSavingPassword(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/advisers/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          adviser: {
            current_password: currentPassword,
            password: newPassword,
            password_confirmation: confirmPassword,
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        await swal.success("Password Updated", "Your password has been changed successfully.");
      } else {
        await swal.error("Update Failed", (data.errors ?? []).join("\n"));
      }
    } catch {
      await swal.connectionError();
    } finally {
      setIsSavingPassword(false);
    }
  }

  const effectiveAvatarUrl = avatarPreview ? null : (user?.avatar_url ?? null);

  return (
    <div className="px-8 py-10 flex flex-col gap-10 max-w-2xl">
      {/* Avatar */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900">Profile Picture</h2>
        <AvatarCropper
          currentAvatarUrl={effectiveAvatarUrl}
          apiBaseUrl={API_BASE_URL}
          onCropped={handleAvatarCropped}
        />
        {avatarPreview && (
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-primary">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSaveAvatar}
                disabled={isSavingAvatar}
                className="rounded-md bg-primary px-5 py-2 text-sm font-bold text-white hover:opacity-90 hover:cursor-pointer disabled:opacity-40"
              >
                {isSavingAvatar ? "Saving..." : "Save Avatar"}
              </button>
              <button
                type="button"
                onClick={() => { setPendingAvatarBlob(null); setAvatarPreview(null); }}
                className="rounded-md border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </section>

      <hr className="border-gray-200" />

      {/* Profile info */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900">Profile Information</h2>
        <form onSubmit={handleSaveInfo} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="First Name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <InputField
              label="Middle Name"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
            />
          </div>
          <InputField
            label="Last Name"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <InputField
            label="Email"
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <SelectField
            label="Department"
            required
            options={DEPARTMENT_OPTIONS}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Select"
          />
          <div className="flex">
            <button
              type="submit"
              disabled={isSavingInfo}
              className="rounded-md bg-primary px-8 py-2.5 text-sm font-bold text-white hover:opacity-90 hover:cursor-pointer disabled:opacity-40 active:scale-[0.98] transition-all"
            >
              {isSavingInfo ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>

      <hr className="border-gray-200" />

      {/* Password */}
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
        <form onSubmit={handleSavePassword} className="flex flex-col gap-4">
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
          />
          <PasswordField
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
          <div className="flex">
            <button
              type="submit"
              disabled={isSavingPassword}
              className="rounded-md bg-primary px-8 py-2.5 text-sm font-bold text-white hover:opacity-90 hover:cursor-pointer disabled:opacity-40 active:scale-[0.98] transition-all"
            >
              {isSavingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
