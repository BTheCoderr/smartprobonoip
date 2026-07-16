import Image from "next/image";
import Link from "next/link";
import { LANDING_COPY, SOCIAL_PROOF_SLOT } from "@/lib/copy";
import { PaperShell, Section, SectionHeader } from "@/components/ui/design";

/**
 * Drop-in homepage slot for named quotes and partner logos.
 * Stays empty/subdued until SOCIAL_PROOF_SLOT is populated with permissioned content.
 * Does not invent names, logos, or endorsements.
 */
export function SocialProofSlot() {
  const { quotes, logos } = SOCIAL_PROOF_SLOT;
  const hasQuotes = quotes.length > 0;
  const hasLogos = logos.length > 0;

  if (!hasQuotes && !hasLogos) {
    return (
      <Section soft>
        <PaperShell>
          <SectionHeader
            kicker="Pilot partners"
            title="Building proof with real partners"
            lead={LANDING_COPY.socialProofEmptyLead}
          />
        </PaperShell>
      </Section>
    );
  }

  return (
    <Section soft>
      <PaperShell>
        <SectionHeader
          kicker="Pilot partners"
          title="What partners say"
          lead="Shared with permission from Rhode Island pilot partners."
        />

        {hasQuotes ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {quotes.map((item) => (
              <blockquote
                key={`${item.name}-${item.role}`}
                className="rounded-md border border-mist-200/90 bg-white/80 p-5"
              >
                <p className="text-sm leading-relaxed text-navy-800">
                  “{item.quote}”
                </p>
                <footer className="mt-3 text-xs text-navy-600">
                  <span className="font-semibold text-navy-800">{item.name}</span>
                  {" · "}
                  {item.role}
                  {item.org ? ` · ${item.org}` : null}
                </footer>
              </blockquote>
            ))}
          </div>
        ) : null}

        {hasLogos ? (
          <ul className="mt-8 flex flex-wrap items-center justify-center gap-6">
            {logos.map((logo) => {
              const image = (
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={140}
                  height={48}
                  className="h-10 w-auto object-contain opacity-80"
                />
              );
              return (
                <li key={logo.name}>
                  {logo.href ? (
                    <Link href={logo.href} className="inline-block">
                      {image}
                    </Link>
                  ) : (
                    image
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
      </PaperShell>
    </Section>
  );
}
