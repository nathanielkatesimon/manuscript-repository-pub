import AdviserManuscriptShowPage from "@/app/components/AdviserManuscriptShowPage";

export default async function AdviserManuscriptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AdviserManuscriptShowPage id={id} />;
}
