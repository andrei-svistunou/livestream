import "@/styles/globals.css";

import { Theme } from "@radix-ui/themes";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Studio — Stream & Watch",
  description:
    "A premium livestream platform built with LiveKit. Start streaming or join an audience in seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-body">
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
