import ManuscriptShowPage from "@/app/components/ManuscriptShowPage";

export default async function RepositoryManuscriptShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ManuscriptShowPage showTitle="Repository" id={id} />;
}
