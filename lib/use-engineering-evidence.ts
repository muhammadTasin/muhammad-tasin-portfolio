"use client";
import { useSyncExternalStore } from "react";
import { createEvidenceStore, INITIAL_EVIDENCE } from "./evidence-store";

const store = createEvidenceStore();
export function useEngineeringEvidence() {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => INITIAL_EVIDENCE);
}
