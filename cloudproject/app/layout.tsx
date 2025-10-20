import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Cloud Project",
  description: "File upload & management app",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
