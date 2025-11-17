import "./globals.css";
import { Inter, Montserrat } from "next/font/google";
import { Suspense } from "react";
import AppWapper from "./AppWapper";
import { headers } from "next/headers";
import Script from "next/script";
import Image from "next/image";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const host = (await headers()).get("host")?.split(":")[0].toLowerCase() || "";
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

        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '644795937619117');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <Image
            height={1}
            width={1}
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=644795937619117&ev=PageView&noscript=1"
            alt=""
            unoptimized
          />
        </noscript>
      </body>
    </html>
  );
}
