import AdviserManuscriptList from "@/app/components/AdviserManuscriptList";

export default function RejectedManuscriptPage() {
  return (
    <AdviserManuscriptList
      status="rejected"
      title="Rejected Manuscripts"
      description="Manuscripts that have been rejected."
    />
  );
}
