import { useSelector } from "@/shared/lib";

export function useNodeSelection(nodeId: string) {
  const isFocused = useSelector((s) => s.selection.focusedId === nodeId);
  //наверное придется selectedIds сделать обьектом чтобы при большом количестве блоков проверка прошла за O(1)
  const isSelected = useSelector((s) =>
    s.selection.selectedIds.includes(nodeId),
  );

  const isOnlySelected = useSelector(
    (s) =>
      s.selection.selectedIds.length === 1 &&
      s.selection.selectedIds.includes(nodeId),
  );

  return {
    isFocused,
    isSelected,
    isOnlySelected
  };
}
