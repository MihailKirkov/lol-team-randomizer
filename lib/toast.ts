// lib/toast.ts
import { toast } from "sonner";

export type ToastType = "SUCCESS" | "ERROR" | "INFO";

export function showToast(
  type: ToastType = "INFO",
  message: string,
  title?: string
) {
  const colors = {
    SUCCESS: {
      bg: "rgba(16, 185, 129, 0.14)",     // emerald glass
      border: "1px solid rgba(16,185,129,0.4)",
    },
    ERROR: {
      bg: "rgba(239, 68, 68, 0.14)",       // red glass
      border: "1px solid rgba(239,68,68,0.4)",
    },
    INFO: {
      bg: "rgba(59, 130, 246, 0.14)",      // blue glass
      border: "1px solid rgba(59,130,246,0.4)",
    },
  };

  const style = {
    background: colors[type].bg,
    color: "white",
    border: colors[type].border,
    backdropFilter: "blur(14px)",
    boxShadow: "0 8px 22px rgba(0,0,0,0.12)",
  } as React.CSSProperties;

  switch (type) {
    case "SUCCESS":
      toast.success(title ?? "Success", { description: message, style });
      break;
    case "ERROR":
      toast.error(title ?? "Error", { description: message, style });
      break;
    default:
      toast(title ?? "Info", { description: message, style });
  }
}
