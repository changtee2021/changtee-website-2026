export function ChangteeWordmark({
  className,
  title = "ช่างตี๋",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 132 36"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <text
        x="0"
        y="28"
        fill="currentColor"
        fontFamily="var(--font-display), Prompt, IBM Plex Sans Thai, sans-serif"
        fontSize="28"
        fontWeight="700"
        letterSpacing="0.02em"
      >
        ช่างตี๋
      </text>
    </svg>
  );
}
