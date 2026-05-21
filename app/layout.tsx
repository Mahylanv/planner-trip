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
    icon: "/icons/icon.svg",
    apple: "/icons/maskable-icon.svg",
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
