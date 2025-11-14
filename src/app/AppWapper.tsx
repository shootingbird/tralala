"use client";

import { store, persistor } from "@/lib/store/store";
import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastProvider } from "@/components/ui/toast";
import { AuthProvider } from "@/contexts/AuthContext";
import MobileNav from "@/components/shared/MobileNav";

const AppWapper = ({
  children,
  host = "",
}: {
  children: React.ReactNode;
  host: string;
}) => {
  const [isClient, setIsClient] = useState(false);
  console.log(host);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Provider store={store}>
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </Provider>
    );
  }
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <ToastProvider>
            {children}
            <div className="w-full h-20" />

            {host === "steadfast.ng" ||
            host === "localhost" ||
            host === "frontend-nextjs-production-936a.up.railway.app" ? (
              <MobileNav />
            ) : null}
          </ToastProvider>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
};

export default AppWapper;
