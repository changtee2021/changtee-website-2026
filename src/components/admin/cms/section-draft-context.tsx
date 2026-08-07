"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { upsertPageSection, usePageSections } from "@/lib/cms/demo-store";
import type { SectionDef, SectionFieldDef } from "@/lib/cms/page-sections";

export type SelectedField = {
  sectionId: string;
  field: SectionFieldDef;
};

type DraftMap = Record<string, Record<string, string>>;

type SectionDraftContextValue = {
  pageKey: string;
  defs: SectionDef[];
  defaults: Record<string, Record<string, string>>;
  drafts: DraftMap;
  dirty: boolean;
  /** Current field value differs from when the spot was opened */
  fieldDirty: boolean;
  selected: SelectedField | null;
  lockHint: string | null;
  getValues: (sectionId: string) => Record<string, string>;
  select: (sectionId: string, fieldKey: string) => boolean;
  clearSelect: () => void;
  setField: (sectionId: string, key: string, value: string) => void;
  /** Accept this spot’s edit, then allow editing other spots */
  confirmField: () => void;
  /** Discard this spot’s edit and close the panel */
  revertField: () => void;
  /**
   * Accept current drafts as the editor baseline (does not publish).
   * Use commitToStore() after a successful publish to sync the live store.
   */
  confirm: () => void;
  /** Write accepted drafts into the client page-sections store (post-publish). */
  commitToStore: () => void;
  discard: () => void;
};

const SectionDraftContext = createContext<SectionDraftContextValue | null>(
  null,
);

function buildInitial(
  pageKey: string,
  defs: SectionDef[],
  defaults: Record<string, Record<string, string>>,
  stored: ReturnType<typeof usePageSections>,
): DraftMap {
  const map: DraftMap = {};
  for (const def of defs) {
    const rec = stored.find(
      (r) => r.pageKey === pageKey && r.sectionId === def.id,
    );
    map[def.id] = { ...(defaults[def.id] ?? {}), ...(rec?.values ?? {}) };
  }
  return map;
}

function cloneMap(map: DraftMap): DraftMap {
  return structuredClone(map);
}

export function SectionDraftProvider({
  pageKey,
  defs,
  defaults,
  children,
}: {
  pageKey: string;
  defs: SectionDef[];
  defaults: Record<string, Record<string, string>>;
  children: ReactNode;
}) {
  const stored = usePageSections();
  const [drafts, setDrafts] = useState<DraftMap>(() =>
    buildInitial(pageKey, defs, defaults, stored),
  );
  const [baseline, setBaseline] = useState<DraftMap>(() =>
    buildInitial(pageKey, defs, defaults, stored),
  );
  const [selected, setSelected] = useState<SelectedField | null>(null);
  /** Value of the selected field when the panel opened (or last field-confirm) */
  const [openValue, setOpenValue] = useState<string | null>(null);
  const [lockHint, setLockHint] = useState<string | null>(null);

  // Remount via key={pageKey} on the provider when switching pages

  const dirty = useMemo(
    () => JSON.stringify(drafts) !== JSON.stringify(baseline),
    [drafts, baseline],
  );

  const getValues = useCallback(
    (sectionId: string) => drafts[sectionId] ?? defaults[sectionId] ?? {},
    [drafts, defaults],
  );

  const currentSelectedValue = useMemo(() => {
    if (!selected) return "";
    return getValues(selected.sectionId)[selected.field.key] ?? "";
  }, [selected, getValues]);

  const fieldDirty =
    selected !== null &&
    openValue !== null &&
    currentSelectedValue !== openValue;

  const select = useCallback(
    (sectionId: string, fieldKey: string) => {
      const def = defs.find((d) => d.id === sectionId);
      const field = def?.fields.find((f) => f.key === fieldKey);
      if (!field) return false;

      const sameSpot =
        selected?.sectionId === sectionId && selected.field.key === fieldKey;
      if (sameSpot) return true;

      if (fieldDirty) {
        setLockHint(
          "กรุณากด “ยืนยันจุดนี้” หรือ “ทิ้งการแก้จุดนี้” ก่อนเปลี่ยนไปแก้ส่วนอื่น",
        );
        return false;
      }

      const value = drafts[sectionId]?.[fieldKey] ?? defaults[sectionId]?.[fieldKey] ?? "";
      setSelected({ sectionId, field });
      setOpenValue(value);
      setLockHint(null);
      return true;
    },
    [defs, selected, fieldDirty, drafts, defaults],
  );

  const clearSelect = useCallback(() => {
    if (fieldDirty) {
      setLockHint(
        "กรุณากด “ยืนยันจุดนี้” หรือ “ทิ้งการแก้จุดนี้” ก่อนปิดแผง",
      );
      return;
    }
    setSelected(null);
    setOpenValue(null);
    setLockHint(null);
  }, [fieldDirty]);

  const setField = useCallback(
    (sectionId: string, key: string, value: string) => {
      setDrafts((prev) => ({
        ...prev,
        [sectionId]: { ...(prev[sectionId] ?? {}), [key]: value },
      }));
      setLockHint(null);
    },
    [],
  );

  const confirmField = useCallback(() => {
    if (!selected) return;
    setOpenValue(currentSelectedValue);
    setSelected(null);
    setOpenValue(null);
    setLockHint(null);
  }, [selected, currentSelectedValue]);

  const revertField = useCallback(() => {
    if (!selected || openValue === null) {
      setSelected(null);
      setOpenValue(null);
      setLockHint(null);
      return;
    }
    const { sectionId, field } = selected;
    setDrafts((prev) => ({
      ...prev,
      [sectionId]: { ...(prev[sectionId] ?? {}), [field.key]: openValue },
    }));
    setSelected(null);
    setOpenValue(null);
    setLockHint(null);
  }, [selected, openValue]);

  const confirm = useCallback(() => {
    if (fieldDirty) {
      setLockHint(
        "กรุณายืนยันจุดที่กำลังแก้ก่อน แล้วค่อยบันทึกร่างหรือเผยแพร่",
      );
      return;
    }
    setBaseline(cloneMap(drafts));
    setSelected(null);
    setOpenValue(null);
    setLockHint(null);
  }, [drafts, fieldDirty]);

  const commitToStore = useCallback(() => {
    const now = new Date().toISOString();
    for (const def of defs) {
      const values = drafts[def.id] ?? defaults[def.id] ?? {};
      const prev = stored.find(
        (r) => r.pageKey === pageKey && r.sectionId === def.id,
      );
      upsertPageSection({
        pageKey,
        sectionId: def.id,
        enabled: prev?.enabled ?? true,
        values,
        updatedAt: now,
      });
    }
    setBaseline(cloneMap(drafts));
    setSelected(null);
    setOpenValue(null);
    setLockHint(null);
  }, [defs, drafts, defaults, pageKey, stored]);

  const discard = useCallback(() => {
    setDrafts(cloneMap(baseline));
    setSelected(null);
    setOpenValue(null);
    setLockHint(null);
  }, [baseline]);

  const value = useMemo(
    () => ({
      pageKey,
      defs,
      defaults,
      drafts,
      dirty,
      fieldDirty,
      selected,
      lockHint,
      getValues,
      select,
      clearSelect,
      setField,
      confirmField,
      revertField,
      confirm,
      commitToStore,
      discard,
    }),
    [
      pageKey,
      defs,
      defaults,
      drafts,
      dirty,
      fieldDirty,
      selected,
      lockHint,
      getValues,
      select,
      clearSelect,
      setField,
      confirmField,
      revertField,
      confirm,
      commitToStore,
      discard,
    ],
  );

  return (
    <SectionDraftContext.Provider value={value}>
      {children}
    </SectionDraftContext.Provider>
  );
}

export function useSectionDraft() {
  const ctx = useContext(SectionDraftContext);
  if (!ctx) {
    throw new Error("useSectionDraft must be used within SectionDraftProvider");
  }
  return ctx;
}

/** Safe hook for preview spots — returns null outside provider */
export function useSectionDraftOptional() {
  return useContext(SectionDraftContext);
}
