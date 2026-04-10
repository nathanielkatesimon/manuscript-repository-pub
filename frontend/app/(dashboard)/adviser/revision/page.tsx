import AdviserManuscriptList from "@/app/components/AdviserManuscriptList";

export default function RevisionPage() {
  return (
    <AdviserManuscriptList
      status="revision"
      title="Manuscripts for Revision"
      description="Manuscripts that have been sent back for revision."
    />
  );
}
