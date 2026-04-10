import RouteGuard from "@/app/components/RouteGuard";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";

const navItems = [
  { label: "Repository", href: "/student/repository" },
  { label: "Categories", href: "/student/categories" },
  { label: "My Downloads", href: "/student/downloads" },
  { label: "Uploads", href: "/student/uploads" },
  { label: "Profile", href: "/student/profile" },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRole="student">
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar navItems={navItems} />
        <div className="flex flex-1 flex-col pl-60">
          <Topbar />
          <main className="flex-1 bg-white">{children}</main>
        </div>
      </div>
    </RouteGuard>
  );
}
