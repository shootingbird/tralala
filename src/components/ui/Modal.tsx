import { useEffect, useState } from "react";
import { Info, AlertCircle, CheckCircle, X, XCircle } from "lucide-react";
import { Button } from "./Button";

type ModalType = "info" | "warning" | "success" | "error";

interface ModalButton {
  text: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "outline";
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ModalType;
  title: string;
  message: string;
  bottomText?: string;
  buttons?: ModalButton[];
  autoClose?: boolean;
  autoCloseTime?: number; // in milliseconds
}

export const Modal = ({
  isOpen,
  onClose,
  type,
  title,
  message,
  bottomText,
  buttons,
  autoClose = false,
  autoCloseTime = 3000,
}: ModalProps) => {
  const [progress, setProgress] = useState(100);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setProgress(100);
    } else {
      setTimeout(() => setIsVisible(false), 300); // Animation duration
    }
  }, [isOpen]);

  useEffect(() => {
    if (autoClose && isOpen) {
      const startTime = Date.now();
      const endTime = startTime + autoCloseTime;

      const updateProgress = () => {
        const now = Date.now();
        const remaining = Math.max(0, endTime - now);
        const newProgress = (remaining / autoCloseTime) * 100;

        if (newProgress > 0) {
          setProgress(newProgress);
          requestAnimationFrame(updateProgress);
        } else {
          onClose();
        }
      };

      requestAnimationFrame(updateProgress);
      const timer = setTimeout(onClose, autoCloseTime);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, isOpen, onClose]);

  const icons = {
    info: <Info className="w-12 h-12 text-blue-500" />,
    warning: <AlertCircle className="w-12 h-12 text-yellow-500" />,
    success: <CheckCircle className="w-12 h-12 text-green-500" />,
    error: <XCircle className="w-12 h-12 text-red-500" />,
  };

  const bgColors = {
    info: "bg-blue-50",
    warning: "bg-yellow-50",
    success: "bg-green-50",
    error: "bg-red-50",
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isOpen ? "opacity-100" : "opacity-0"
      } transition-opacity duration-300`}
    >
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div
        className={`relative bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden ${
          isOpen ? "translate-y-0" : "translate-y-4"
        } transition-transform duration-300`}
      >
        {/* Close button */}
        {!autoClose && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content */}
        <div className="p-6">
          <div
            className={`w-full flex items-center justify-center p-4 rounded-lg ${bgColors[type]}`}
          >
            {icons[type]}
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 text-gray-600">{message}</p>
          </div>

          {/* Buttons */}
          {buttons && buttons.length > 0 && (
            <div className="mt-6 flex gap-3 justify-center">
              {buttons.map((button, index) => (
                <Button key={index} onClick={button.onClick}>
                  {button.text}
                </Button>
              ))}
            </div>
          )}

          {/* Bottom Text */}
          {bottomText && (
            <p className="mt-4 text-sm text-center text-gray-500">
              {bottomText}
            </p>
          )}
        </div>

        {/* Progress bar */}
        {autoClose && (
          <div className="h-1 bg-gray-200">
            <div
              className="h-full bg-blue-500 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
