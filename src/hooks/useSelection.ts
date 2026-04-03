import { useSelector } from "../shared/lib";

export function useSelection() {
  const selectedIds = useSelector((s) => s.selection.selectedIds);
  const focusedId = useSelector((s) => s.selection.focusedId);

  return {
    selectedIds,
    focusedId,
  };
}
