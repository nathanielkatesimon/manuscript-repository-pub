import RouteGuard from "@/app/components/RouteGuard";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Manage Categories", href: "/admin/manage-categories" },
  { label: "Download Requests", href: "/admin/download-requests" },
  { label: "Manuscripts", href: "/admin/manuscripts" },
  { label: "Students", href: "/admin/students" },
  { label: "Advisers", href: "/admin/advisers" },
  { label: "Profile", href: "/admin/profile" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRole="admin">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar navItems={navItems} />
        <div className="flex flex-1 flex-col pl-60">
          <Topbar />
          <main className="flex-1 bg-white  ">{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}
