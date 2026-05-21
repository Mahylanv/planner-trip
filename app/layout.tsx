import type { Metadata, Viewport } from "next";
import "leaflet/dist/leaflet.css";
import { PwaRegister } from "./components/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Amsud Planner",
  description: "Organisateur de voyage en Amerique du Sud",
  applicationName: "Amsud Planner",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Amsud Planner",
  },
  icons: {
    icon: [
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#087d8f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
