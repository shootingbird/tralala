import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "secondary_outline";
  isLoading?: boolean;
  rounded?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      isLoading,
      className = "",
      rounded = false,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "w-full px-4 py-3 text-sm font-medium transition-colors duration-200";

    const variants = {
      primary: "bg-[#184193] text-white hover:bg-[#184193]",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
      outline: "border-2 border-gray-300 hover:border-gray-400",
      secondary_outline: "bg-[#F5F3FF] text-[#184193] hover:bg-[#F5F3FF]/80",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${
          rounded == true ? "rounded-full" : "rounded-lg"
        } ${variants[variant]} cursor-pointer ${className}`}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
