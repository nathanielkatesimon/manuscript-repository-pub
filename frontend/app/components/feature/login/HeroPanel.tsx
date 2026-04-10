interface HeroPanelProps {
  className?: string;
}

export default function HeroPanel({ className = "" }: HeroPanelProps) {
  return (
    <div className={`flex flex-col justify-center px-10 py-12 ${className}`}>
      <h1 className="text-5xl font-extrabold leading-tight text-white">
        Research
        <br />
        Manuscript
        <br />
        Repository
      </h1>
      <p className="mt-5 text-base text-white/70 font-medium">
        Archiving Academic Works Digitally.
      </p>
    </div>
  );
}