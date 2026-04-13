import useUserStore from "@/store/userStore";

const SESSION_EXPIRED_MESSAGE = "Session expired";
const LOGIN_PATH = "/login";

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, options);

  if (response.status === 401 && typeof window !== "undefined") {
    try {
      // Clone before reading so the original response body remains available for callers
      const data = await response.clone().json();
      if (Array.isArray(data.errors) && data.errors.includes(SESSION_EXPIRED_MESSAGE)) {
        useUserStore.getState().clearUser();
        window.location.replace(LOGIN_PATH);
        // Return a never-resolving promise so the caller's await hangs while the
        // page navigates away, preventing any catch block from firing a dialog.
        return new Promise(() => {});
      }
    } catch {
      // ignore JSON parse errors or other unexpected errors
    }
  }

  return response;
}
