import type { Metadata } from "next";
import { AdminLayoutClient } from "./AdminLayoutClient";

export const metadata: Metadata = {
  title: "Admin Portal | POAB Global Construction",
  icons: {
    icon: [
      { url: "/brand/poab-pillar.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/brand/poab-pillar.svg", type: "image/svg+xml" },
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
