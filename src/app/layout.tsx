import "./globals.css";
import { Inter, Montserrat } from "next/font/google";
import { Suspense } from "react";
import AppWapper from "./AppWapper";
import { headers } from "next/headers";

const montserrat = Montserrat({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Steadfast International",
  description: "Your trusted source for quality products",
  keywords: "ecommerce, online shopping, PWA, affiliate marketing",
  authors: [{ name: "Efemiaya Favour Oghenetega" }],
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Steadfast Store",
  },
  verification: {
    google: "5QCc5EI3MesY5BBxvV_6w_abP_hGMQO44HVvgSOAHSc",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#184193",
  maximumScale: 1,
  minimumScale: 1,
  userScalable: "no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const host = headers().get("host")?.split(":")[0].toLowerCase();
  console.log("Host in layout:", host);
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable}`}>
      <head>
        <meta
          name="google-site-verification"
          content="5QCc5EI3MesY5BBxvV_6w_abP_hGMQO44HVvgSOAHSc"
        />
      </head>
      <body className={`${montserrat.className}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AppWapper host={host}>{children}</AppWapper>
        </Suspense>
      </body>
    </html>
  );
}
