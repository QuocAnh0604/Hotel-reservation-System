import { PublicLayout } from "@/layouts/PublicLayout";

export const instant = false;

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}
