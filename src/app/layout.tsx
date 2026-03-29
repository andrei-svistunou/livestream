import "@/styles/globals.css";

import { Theme } from "@radix-ui/themes";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Live Studio — Stream & Watch",
  description:
    "A premium livestream platform built with LiveKit. Start streaming or join an audience in seconds.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0B0E14",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body h-full w-full">
        <Theme
          appearance="dark"
          accentColor="purple"
          grayColor="mauve"
          radius="none"
        >
          {children}
        </Theme>
      </body>
    </html>
  );
}
