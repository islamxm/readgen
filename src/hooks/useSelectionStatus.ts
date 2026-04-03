import { useSelector } from "@/shared/lib";

export function useSelectionStatus() {
  const hasSelection = useSelector((s) => s.selection.selectedIds.length > 0);
  const isMultipleSelected = useSelector(
    (s) => s.selection.selectedIds.length > 1,
  );

  return {
    hasSelection,
    isMultipleSelected,
  };
}
