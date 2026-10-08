import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aeros — The intelligence layer for aviation operations",
  description:
    "Aeros connects schedules, weather, aircraft, pilots, maintenance, training, FAA data and operator policy to understand operational changes, simulate downstream impact and build recovery plans.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface font-sans">{children}</body>
    </html>
  );
}
