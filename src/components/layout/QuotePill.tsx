import { IconSlide } from "@/components/layout/IconSlide";

type Props = {
  label: string;
  className?: string;
};

export function QuotePill({ label, className }: Props) {
  return <IconSlide href="/quote" label={label} className={className} icon={<QuoteMark />} />;
}

function QuoteMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path
        d="M7 3.75h7.2L18 7.4V14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 3.75v12.1h5.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.2 8.1h5.1M9.2 11h3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="16.6" cy="17.1" r="3.35" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M16.6 15.45v3.3M15.15 16.7h2.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
