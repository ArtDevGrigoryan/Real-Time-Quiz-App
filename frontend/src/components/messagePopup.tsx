import { useEffect } from "react";

type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  ttl?: number;
}

export function Toast({ message, type, onClose, ttl = 1000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, ttl);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors =
    type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white";

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className={`px-6 py-3 rounded-lg shadow-lg ${colors}`}>
        {message}
      </div>
    </div>
  );
}

export default Toast;
