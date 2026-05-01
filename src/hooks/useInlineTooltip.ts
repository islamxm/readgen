import { useSelector } from "@shared/lib";

export function useInlineTooltip(tooltipId: string) {
  const isActive = useSelector((s) => s.ui.inlineTooltips.includes(tooltipId));
  const isOnlyActive = useSelector((s) => s.ui.inlineTooltips.length === 1) && isActive;

  return { isActive, isOnlyActive };
}
