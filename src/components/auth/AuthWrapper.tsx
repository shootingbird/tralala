import Image from "next/image";
import Link from "next/link";

interface AuthWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthWrapper = ({
  children,
  title,
  subtitle,
}: AuthWrapperProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="py-4">
        <div className="px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Image
              src="/steadfast-logo.svg"
              alt="Steadfast International"
              width={150}
              height={40}
            />
          </Link>
        </div>
      </div>
      <div className="flex-1 flex flex-col md:justify-center items-center">
        <div className="max-w-lg w-full space-y-8 rounded-[1.2rem] md:border-2 mb-[5rem] py-[2rem] md:py-[3rem] items-center flex-col justify-center px-[2rem] md:px-[3rem] border-[#00000010] ">
          {(title || subtitle) && (
            <div className="text-center ">
              {title && (
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              )}
              {subtitle && (
                <p className="mt-4 text-sm text-gray-600">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
