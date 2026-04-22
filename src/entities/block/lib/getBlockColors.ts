import type { MOMBlockNodeType } from "@/mom/types";
import { BLOCK_THEMATIC_COLORS } from "../model/blockThematicColors";

export function getBlockColors(nodeType: MOMBlockNodeType) {
  return BLOCK_THEMATIC_COLORS[nodeType];
}
