import { LayoutClient } from "@/components/layout/layout-client";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LayoutClient>{children}</LayoutClient>;
}
