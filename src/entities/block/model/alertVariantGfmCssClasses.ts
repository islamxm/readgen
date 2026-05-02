import type { MOMAlert } from "@/mom/types";

export const alertVariantGfmCssClasses: Record<MOMAlert["variant"], string> = {
  caution: "markdown-alert-caution",
  tip: "markdown-alert-tip",
  important: "markdown-alert-important",
  warning: "markdown-alert-warning",
  note: "markdown-alert-note",
};