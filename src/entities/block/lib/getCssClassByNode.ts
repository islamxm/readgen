import type { MOMAllContent } from "@/mom/types";
import { alertVariantGfmCssClasses } from "../model/alertVariantGfmCssClasses";

export function getCssClassByNode(node: MOMAllContent) {
  if (node.type === "paragraph") {
    return "p";
  }
  if (node.type === "heading") {
    return `h${node.depth}`;
  }
  if (node.type === "blockquote") {
    return "blockquote";
  }
  if (node.type === "alert") {
    return `markdown-alert-wrapper ${alertVariantGfmCssClasses[node.variant]}`;
  }
  if (node.type === "list" && node.ordered) {
    return "ol";
  }
  if (node.type === "list") {
    return "ul";
  }
  if (node.type === "thematicBreak") {
    return "hr";
  }
  if (node.type === "image") {
    return "img";
  }
  return "";
}
