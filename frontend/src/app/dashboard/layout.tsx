import DashboardLayoutWrapper from "@/components/layout/dashboard-layout-wrapper";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return <DashboardLayoutWrapper>{children}</DashboardLayoutWrapper>;
}
