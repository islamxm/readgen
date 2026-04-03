import type { MOMBlockNodeType } from "../mom/types";

type ThematicColor = { bg: string; border: string; text: string };

export const BLOCK_THEMATIC_COLORS: Record<MOMBlockNodeType, ThematicColor> = {
  paragraph: { bg: "#FEF3E8", border: "#FDDCB0", text: "#F5C68A" },
  heading: { bg: "#EDFAF3", border: "#BBEED5", text: "#86DEAD" },
  code: { bg: "#F0F4FF", border: "#C7D3FA", text: "#A3B4F5" },
  blockquote: { bg: "#FDF4FF", border: "#EDD5FA", text: "#D8A8F0" },
  alert: { bg: "#FDF4FF", border: "#EDD5FA", text: "#D8A8F0" },
  list: { bg: "#FFF8ED", border: "#FDDFA0", text: "#F5C97A" },
  image: { bg: "#FFF0F3", border: "#FCCDD6", text: "#F5A8B8" },
  // thematicBreak: { bg: "#F5F5F0", border: "#E0DED8", text: "#C8C6BC" },
  thematicBreak: { bg: "transparent", border: "#E0DED8", text: "transparent" },
};
// export const BLOCK_THEMATIC_COLORS: Record<MOMBlockNodeType, ThematicColor> = {
//   paragraph: { bg: "#FFFDFB", border: "#FDDCB0", text: "#F5C68A" },
//   heading: { bg: "#FAFFFD", border: "#BBEED5", text: "#86DEAD" },
//   code: { bg: "#FBFCFF", border: "#C7D3FA", text: "#A3B4F5" },
//   blockquote: { bg: "#FFFDFF", border: "#EDD5FA", text: "#D8A8F0" },
//   alert: { bg: "#fff", border: "#fff", text: "#fff" },
//   list: { bg: "#FFFDF9", border: "#FDDFA0", text: "#F5C97A" },
//   image: { bg: "#FFFBFB", border: "#FCCDD6", text: "#F5A8B8" },
//   thematicBreak: { bg: "#FCFCFB", border: "#E0DED8", text: "#C8C6BC" },
// };

export function getBlockColors(nodeType: MOMBlockNodeType) {
  return BLOCK_THEMATIC_COLORS[nodeType];
}
