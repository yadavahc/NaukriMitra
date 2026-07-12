import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "NaukriMitra — Yadava's Job Autopilot",
  description: "Personal job discovery, auto-apply and tracking dashboard.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-x-hidden px-6 py-6 md:px-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
