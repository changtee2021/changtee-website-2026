"use client";

import { MessageCircle, Ruler, Truck } from "lucide-react";
import { Reveal } from "@/components/home/Reveal";
import { EditableSpot } from "@/components/preview/EditableSpot";
import { useSectionValues } from "@/lib/cms/demo-store";
import { HOME_SECTION_DEFAULTS } from "@/lib/cms/page-sections";

const STEP_ICONS = [MessageCircle, Ruler, Truck] as const;

/** Process steps — rendered inside StatsStory as one combined home section. */
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
    <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr] md:gap-12">
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

      <ol className="relative">
        <span
          aria-hidden
          className="absolute top-3 bottom-3 left-[11px] w-px bg-line md:left-[13px]"
        />

        {steps.map((step, i) => {
          const Icon = STEP_ICONS[i] ?? MessageCircle;
          const isLast = i === steps.length - 1;

          return (
            <Reveal
              as="li"
              key={step.titleKey}
              delayStep={i}
              className={`relative flex gap-4 pl-0 ${isLast ? "pb-0" : "pb-6"}`}
            >
              <span
                aria-hidden
                className="relative z-10 mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-brand-red bg-paper md:mt-1 md:h-7 md:w-7"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brand-red md:h-2 md:w-2" />
              </span>

              <div
                className={`min-w-0 flex-1 ${isLast ? "" : "border-b border-line pb-6"}`}
              >
                <p className="font-display text-sm font-semibold text-brand-red">
                  Step {i + 1}
                </p>
                <div className="mt-1.5 flex items-start gap-2.5">
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red/10 text-brand-red"
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <EditableSpot
                      sectionId="howItWorks"
                      fieldKey={step.titleKey}
                    >
                      <h3 className="font-semibold text-navy">{step.title}</h3>
                    </EditableSpot>
                    <EditableSpot
                      sectionId="howItWorks"
                      fieldKey={step.descKey}
                    >
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">
                        {step.desc}
                      </p>
                    </EditableSpot>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}
