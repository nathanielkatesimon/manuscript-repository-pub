import AdminManuscriptShowPage from "@/app/components/AdminManuscriptShowPage";

export default async function AdminManuscriptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdminManuscriptShowPage id={id} />;
}
