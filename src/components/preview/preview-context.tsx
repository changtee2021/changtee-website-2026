"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SpotScope } from "@/lib/editor/protocol";

type PreviewControls = {
  setShowAllSpots: (v: boolean) => void;
  setHighlightKey: (v: string | null) => void;
};

let previewControls: PreviewControls | null = null;

export function getPreviewControls() {
  return previewControls;
}

type PreviewContextValue = {
  active: boolean;
  pageKey: string;
  showAllSpots: boolean;
  highlightKey: string | null;
  select: (sectionId: string, fieldKey: string) => void;
  registerSpot: (
    sectionId: string,
    fieldKey: string,
    el: HTMLElement | null,
    scope: SpotScope,
  ) => void;
};

const PreviewContext = createContext<PreviewContextValue | null>(null);

export function usePreviewMode() {
  return useContext(PreviewContext);
}

export function PreviewProvider({
  pageKey,
  onSelect,
  children,
}: {
  pageKey: string;
  onSelect: (sectionId: string, fieldKey: string) => void;
  children: ReactNode;
}) {
  const [showAllSpots, setShowAllSpots] = useState(false);
  const [highlightKey, setHighlightKey] = useState<string | null>(null);
  const spotsRef = useRef(
    new Map<string, { el: HTMLElement; scope: SpotScope }>(),
  );

  const select = useCallback(
    (sectionId: string, fieldKey: string) => {
      onSelect(sectionId, fieldKey);
    },
    [onSelect],
  );

  const registerSpot = useCallback(
    (
      sectionId: string,
      fieldKey: string,
      el: HTMLElement | null,
      scope: SpotScope,
    ) => {
      const key = `${sectionId}:${fieldKey}`;
      if (!el) spotsRef.current.delete(key);
      else spotsRef.current.set(key, { el, scope });
    },
    [],
  );

  useEffect(() => {
    previewControls = { setShowAllSpots, setHighlightKey };
    return () => {
      previewControls = null;
    };
  }, []);

  const value = useMemo(
    () => ({
      active: true,
      pageKey,
      showAllSpots,
      highlightKey,
      select,
      registerSpot,
    }),
    [pageKey, showAllSpots, highlightKey, select, registerSpot],
  );

  return (
    <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>
  );
}
