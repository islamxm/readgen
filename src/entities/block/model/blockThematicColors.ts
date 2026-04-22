import type { MOMBlockNodeType } from "@/mom/types";

type ThematicColor = { bg: string; border: string; text: string };

export const BLOCK_THEMATIC_COLORS: Record<MOMBlockNodeType, ThematicColor> = {
  paragraph: { bg: "#FEF3E8", border: "#FDDCB0", text: "#F5C68A" },
  heading: { bg: "#EDFAF3", border: "#BBEED5", text: "#86DEAD" },
  code: { bg: "#F0F4FF", border: "#C7D3FA", text: "#A3B4F5" },
  blockquote: { bg: "#FDF4FF", border: "#EDD5FA", text: "#D8A8F0" },
  alert: { bg: "#FDF4FF", border: "#EDD5FA", text: "#D8A8F0" },
  list: { bg: "#FFF8ED", border: "#FDDFA0", text: "#F5C97A" },
  image: { bg: "#F5F5F4", border: "#E7E5E4", text: "#A8A29E" },
  thematicBreak: { bg: "transparent", border: "#E0DED8", text: "transparent" },
  raw: { bg: "#E8F8FA", border: "#B8E6EC", text: "#73C7D4" },
};
