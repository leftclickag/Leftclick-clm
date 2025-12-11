import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/sidebar";
import { checkRoutePermission } from "@/lib/permissions/route-guards";
import { headers } from "next/headers";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Prüfe Berechtigungen für die aktuelle Route
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // Wenn pathname gesetzt ist, prüfe Berechtigung
  if (pathname && pathname !== "/admin") {
    const hasPermission = await checkRoutePermission(pathname);
    if (!hasPermission) {
      redirect("/admin");
    }
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-1/3 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="container mx-auto p-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
