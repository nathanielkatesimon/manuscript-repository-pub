import AdviserManuscriptList from "@/app/components/AdviserManuscriptList";

export default function PendingPage() {
  return (
    <AdviserManuscriptList
      status="pending"
      title="Pending Manuscripts"
      description="Manuscripts assigned to you that are awaiting review."
    />
  );
}
