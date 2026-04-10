import RouteGuard from "@/app/components/RouteGuard";
import Sidebar from "@/app/components/Sidebar";
import Topbar from "@/app/components/Topbar";

const navItems = [
  { label: "Dashboard", href: "/adviser/dashboard" },
  { label: "Pending", href: "/adviser/pending" },
  { label: "Revision", href: "/adviser/revision" },
  { label: "Rejected Manuscript", href: "/adviser/rejected" },
  { label: "Profile", href: "/adviser/profile" },
];

export default function AdviserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RouteGuard allowedRole="adviser">
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
