import { uiStoreActions } from "@/store/slices/uiSlice";
import { useDispatch, useSelector } from "@shared/lib";

export function useInlineTooltip(tooltipId: string) {
  const dispatch = useDispatch();
  const isActive = useSelector((s) => s.ui.inlineTooltips.includes(tooltipId));
  const isOnlyActive = useSelector((s) => s.ui.inlineTooltips.length === 1) && isActive;

  return { isActive, isOnlyActive };
}
