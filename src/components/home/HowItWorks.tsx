"use client";

import { HomePanel } from "@/components/home/HomePanel";
import { Reveal } from "@/components/home/Reveal";
import { EditableSpot } from "@/components/preview/EditableSpot";
import { useSectionValues } from "@/lib/cms/demo-store";
import { HOME_SECTION_DEFAULTS } from "@/lib/cms/page-sections";

export function HowItWorks() {
  const { values, enabled } = useSectionValues(
    "home",
    "howItWorks",
    HOME_SECTION_DEFAULTS.howItWorks,
  );
  if (!enabled) return null;

  const steps = [
    {
      titleKey: "step1Title",
      descKey: "step1Desc",
      title: values.step1Title,
      desc: values.step1Desc,
    },
    {
      titleKey: "step2Title",
      descKey: "step2Desc",
      title: values.step2Title,
      desc: values.step2Desc,
    },
    {
      titleKey: "step3Title",
      descKey: "step3Desc",
      title: values.step3Title,
      desc: values.step3Desc,
    },
  ];

  return (
    <HomePanel>
      <div className="grid gap-10 p-7 sm:p-9 md:grid-cols-[0.95fr_1.05fr] md:gap-12 md:p-12">
        <Reveal>
          <span
            aria-hidden
            className="block font-display text-6xl leading-none text-navy/10 select-none"
          >
            &ldquo;&nbsp;&rdquo;
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-navy md:text-4xl">
            <EditableSpot sectionId="howItWorks" fieldKey="titleLine1">
              <span className="block">{values.titleLine1}</span>
            </EditableSpot>
            <EditableSpot sectionId="howItWorks" fieldKey="titleLine2">
              <span className="block">{values.titleLine2}</span>
            </EditableSpot>
          </h2>
          <EditableSpot sectionId="howItWorks" fieldKey="intro">
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              {values.intro}
            </p>
          </EditableSpot>
        </Reveal>

        <ol className="divide-y divide-line border-l border-line pl-6 md:pl-8">
          {steps.map((step, i) => (
            <Reveal
              as="li"
              key={step.titleKey}
              delayStep={i}
              className="py-5 first:pt-0 last:pb-0"
            >
              <p className="font-display text-sm font-semibold text-brand-red">
                Step {i + 1}
              </p>
              <EditableSpot sectionId="howItWorks" fieldKey={step.titleKey}>
                <h3 className="mt-1.5 font-semibold text-navy">{step.title}</h3>
              </EditableSpot>
              <EditableSpot sectionId="howItWorks" fieldKey={step.descKey}>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">
                  {step.desc}
                </p>
              </EditableSpot>
            </Reveal>
          ))}
        </ol>
      </div>
    </HomePanel>
  );
}
