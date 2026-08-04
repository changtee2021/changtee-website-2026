import { siteConfig } from "@/lib/site-config";

export function TrustStrip() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-8 md:grid-cols-4">
        {siteConfig.stats.map((stat) => (
          <div key={stat.label} className="text-center md:text-left">
            <div className="font-display text-2xl font-semibold text-navy">{stat.value}</div>
            <div className="mt-1 text-sm text-muted">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
