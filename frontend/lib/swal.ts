/**
 * App-wide SweetAlert2 helper.
 *
 * Usage
 * -----
 * ```ts
 * import { swal } from "@/lib/swal";
 *
 * await swal.success("Title", "Some message");
 * await swal.error("Title", "Something went wrong.");
 * await swal.connectionError();
 * ```
 *
 * All dialogs share the same base configuration (button colour, etc.) so the
 * look-and-feel stays uniform app-wide.  Import and call `swal` anywhere you
 * would otherwise call `Swal.fire` directly.
 */

import Swal, { type SweetAlertOptions } from "sweetalert2";

/** Base config applied to every dialog. */
const BASE: SweetAlertOptions = {
  confirmButtonColor: "var(--color-primary, #4f46e5)",
};

export const swal = {
  /** Show a success dialog. */
  success(title: string, text: string): Promise<void> {
    return Swal.fire({ ...BASE, icon: "success", title, text }).then(() => undefined);
  },

  /** Show an error dialog. */
  error(title: string, text: string): Promise<void> {
    return Swal.fire({ ...BASE, icon: "error", title, text }).then(() => undefined);
  },

  /**
   * Show a connection-error dialog.
   * Use this when a network request fails entirely (no response received).
   */
  connectionError(): Promise<void> {
    return swal.error(
      "Connection Error",
      "Could not connect to the server. Please try again later.",
    );
  },

  /**
   * Show a dialog with arbitrary options merged on top of the base config.
   * Prefer the typed helpers above; use this for one-off customisations.
   */
  fire(options: SweetAlertOptions): ReturnType<typeof Swal.fire> {
    return Swal.fire(Object.assign({}, BASE, options));
  },
};
