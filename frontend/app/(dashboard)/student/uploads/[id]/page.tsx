import ManuscriptShowPage from "@/app/components/ManuscriptShowPage";

export default async function UploadsManuscriptShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ManuscriptShowPage id={id} />;
}
