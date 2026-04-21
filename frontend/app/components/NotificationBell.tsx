"use client";

import { apiFetch } from "@/lib/apiFetch";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/userStore";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

interface NotificationItem {
  id: number;
  message: string;
  notification_type: string;
  metadata: Record<string, unknown>;
  read: boolean;
  read_at: string | null;
  created_at: string;
}

function getCableUrl(token: string) {
  const base = API_BASE_URL.replace(/\/$/, "");
  const wsBase = base.replace(/^http/, "ws");
  return `${wsBase}/cable?token=${encodeURIComponent(token)}`;
}

export default function NotificationBell() {
  const { token, user } = useUserStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const identifier = useMemo(() => JSON.stringify({ channel: "NotificationsChannel" }), []);

  useEffect(() => {
    if (!token || !user) return;

    const loadNotifications = async () => {
      const res = await apiFetch(`${API_BASE_URL}/api/v1/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;

      const json = await res.json();
      setNotifications(json.data ?? []);
      setUnreadCount(json.meta?.unread_count ?? 0);
    };

    loadNotifications();
  }, [token, user]);

  useEffect(() => {
    if (!token || !user) return;

    const ws = new WebSocket(getCableUrl(token));

    ws.onopen = () => {
      ws.send(JSON.stringify({ command: "subscribe", identifier }));
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const incoming = payload?.message?.data as NotificationItem | undefined;

        if (!incoming || payload?.message?.event !== "notification.created") return;

        setNotifications((previous) => [incoming, ...previous].slice(0, 20));
        setUnreadCount((count) => count + 1);
      } catch {
        // ignore malformed socket payloads
      }
    };

    return () => ws.close();
  }, [identifier, token, user]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideButton = wrapperRef.current?.contains(target);
      const clickedInsidePanel = panelRef.current?.contains(target);

      if (!clickedInsideButton && !clickedInsidePanel) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return;

    const updatePanelPosition = () => {
      const trigger = wrapperRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const panelWidth = 320;
      const gap = 8;
      const left = Math.min(
        window.innerWidth - panelWidth - gap,
        Math.max(gap, rect.right - panelWidth)
      );

      setPanelPosition({
        top: rect.bottom + gap,
        left,
      });
    };

    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [open]);

  const markAsRead = async (notificationId: number) => {
    if (!token) return;

    const target = notifications.find((item) => item.id === notificationId);
    if (!target || target.read) return;

    await apiFetch(`${API_BASE_URL}/api/v1/notifications/${notificationId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });

    setNotifications((previous) =>
      previous.map((item) =>
        item.id === notificationId ? { ...item, read: true, read_at: new Date().toISOString() } : item
      )
    );
    setUnreadCount((count) => Math.max(0, count - 1));
  };

  const markAllRead = async () => {
    if (!token) return;

    const res = await apiFetch(`${API_BASE_URL}/api/v1/notifications/mark_all_read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;

    setNotifications((previous) =>
      previous.map((item) => ({ ...item, read: true, read_at: item.read_at ?? new Date().toISOString() }))
    );
    setUnreadCount(0);
  };

  const getResourcePath = (notification: NotificationItem) => {
    const metadata = notification.metadata ?? {};
    const manuscriptId = metadata.manuscript_id;
    const downloadRequestId = metadata.download_request_id;

    if (
      notification.notification_type === "download_request_status_update" &&
      (typeof downloadRequestId === "number" || typeof downloadRequestId === "string")
    ) {
      return `/student/downloads/${downloadRequestId}`;
    }

    if (typeof manuscriptId !== "number" && typeof manuscriptId !== "string") {
      return null;
    }

    if (user?.role === "adviser") return `/adviser/manuscripts/${manuscriptId}`;
    if (user?.role === "student") return `/student/uploads/${manuscriptId}`;
    if (user?.role === "admin") return `/admin/manuscripts/${manuscriptId}`;

    return null;
  };

  const handleNotificationClick = async (notification: NotificationItem) => {
    await markAsRead(notification.id);

    const path = getResourcePath(notification);
    if (!path) return;

    setOpen(false);
    router.push(path);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 hover:cursor-pointer"
        aria-label="Notifications"
        onClick={() => setOpen((state) => !state)}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
          <path d="M12 2a6 6 0 0 0-6 6v3.68c0 .71-.24 1.41-.69 1.98L3.4 16.2A1 1 0 0 0 4.2 18h15.6a1 1 0 0 0 .8-1.8l-1.91-2.54a3.3 3.3 0 0 1-.69-1.98V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 2.83-2H9.17A3 3 0 0 0 12 22Z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] font-semibold leading-4 text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          className="fixed z-[1000] w-80 rounded-lg border border-gray-200 bg-white p-3 text-gray-800 shadow-lg"
          style={{ top: panelPosition.top, left: panelPosition.left }}
        >
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Notifications</h3>
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-medium text-primary hover:underline disabled:text-gray-400"
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-80 space-y-2 overflow-y-auto">
            {notifications.length === 0 && <p className="py-2 text-xs text-gray-500">No notifications yet.</p>}
            {notifications.map((notification) => {
              const resourcePath = getResourcePath(notification);
              const baseClass = notification.read ? "border-gray-200 bg-white" : "border-primary/20 bg-primary/5";

              return (
              <button
                type="button"
                key={notification.id}
                className={`w-full rounded-md border p-2 text-left text-xs ${
                  resourcePath ? `${baseClass} hover:cursor-pointer` : baseClass
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <p className="text-sm">{notification.message}</p>
                <p className="mt-1 text-[11px] text-gray-500">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
                {resourcePath && (
                  <p className="mt-1 text-[11px] font-medium text-primary hover:underline">View details</p>
                )}
              </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
