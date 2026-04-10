import { MOM } from "..";
import type { MOMAllContent } from "../types";

/** Получение итогового состояния MOM документа в виде Markdown строки */
// поработать над безопасностью (XSS)
export function momToMarkdown() {}
export function momToHTML(
  nodes: Array<MOMAllContent>,
  parentId: string | null,
) {
  return nodes.map((node) => momNodeToHTML(node, parentId)).join("");
}
function momNodeToHTML(node: MOMAllContent, parentId: string | null) {
  if (!MOM.Guard.isTextNode(node)) return "";

  const attrs = [
    `data-id="${node.id}"`,
    `data-type="text"`,
    `data-parent-id="${parentId}"`,
    node.marks?.bold ? `data-bold="true"` : "",
    node.marks?.italic ? `data-italic="true"` : "",
    node.marks?.lineThrough ? `data-linethrough="true"` : "",
    node.marks?.link ? `data-link="true"` : "",
    (node.url && node.marks?.link) ? `data-url=${node.url}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `<span ${attrs}>${node.value}</span>`;
}
export const Serializer = {
  momToMarkdown,
  momToHTML,
} as const;
