import { MOM } from "..";
import type {
  MOMAlert,
  MOMAllContent,
  MOMBlockquote,
  MOMCode,
  MOMHeading,
  MOMImage,
  MOMList,
  MOMMap,
  MOMParagraph,
  MOMRaw,
  MOMText,
} from "../types";

export function momToMarkdown(rootOrder: Array<string>, nodes: MOMMap) {
  const gen = serializer(rootOrder, nodes);
  const result = Array.from(gen).join("\n");
  return result;
}
export function momToHTML(
  nodes: Array<MOMAllContent>,
  parentId: string | null,
) { 
  console.log(nodes);
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
    node.url && node.marks?.link ? `data-url=${node.url}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `<span ${attrs}>${node.value}</span>`;
}

function escape(text: string) {
  return text.replace(/[\\*_{}[\]()#+\-.!]/g, "\\$&");
}

export function gatherChildren(childIds: Array<string>, nodes: MOMMap) {
  return childIds
    .map((id) => {
      if (nodes[id].type === "text") {
        return serializeTextNode(nodes[id]);
      }
      return null;
    })
    .filter((f) => f !== null)
    .join("");
}

export function serializeTextNode(node: MOMText) {
  let text = escape(node.value);

  if (node.marks.bold) text = `**${text}**`;
  if (node.marks.italic) text = `*${text}*`;
  if (node.marks.lineThrough) text = `~~${text}~~`;
  if (node.marks.link && node.url) {
    text = `[${text}](${node.url})`;
  }
  return text;
}

export function* serializeHeadingNode(node: MOMHeading) {
  const prefix = "#".repeat(node.depth);
  yield `${prefix} ${escape(node.value)}`;
  yield "";
}

export function* serializeParagraphNode(node: MOMParagraph, nodes: MOMMap) {
  yield gatherChildren(node.children, nodes);
  yield "";
}

export function* serializeBlockquoteNode(node: MOMBlockquote, nodes: MOMMap) {
  yield `> ${gatherChildren(node.children, nodes)}`;
  yield "";
}

export function* serializeAlertNode(node: MOMAlert, nodes: MOMMap) {
  const variantMap: Record<typeof node.variant, string> = {
    warning: "[!WARNING]",
    tip: "[!TIP]",
    caution: "[!CAUTION]",
    important: "[!IMPORTANT]",
    note: "[!NOTE]",
  };
  const content = gatherChildren(node.children, nodes);

  yield `> ${variantMap[node.variant]}`;
  yield `> ${content}`;
  yield "";
}

export function* serializeCodeNode(node: MOMCode) {
  yield "```" + (node.lang ?? "");
  yield node.value;
  yield "```";
  yield "";
}

export function* serializeThematicBreakNode() {
  yield "***";
  yield "";
}

export function* serializeImageNode(node: MOMImage) {
  const sourceUrl = node.url;
  const title = node.title ? ` "${node.title}"` : "";
  const alt = node.alt ?? "";

  let result = `![${alt}](${sourceUrl}${title})`;

  if (node.linkUrl) {
    result = `[${result}](${node.linkUrl})`;
  }

  if (sourceUrl) {
    yield result;
  }
  yield "";
}

export function* serializeListNode(node: MOMList, nodes: MOMMap) {
  for (let i = 0; i < node.children.length; i++) {
    const childId = node.children[i];
    const listItem = nodes[childId];
    if (!listItem || listItem.type !== "listItem") continue;
    const prefix = node.ordered ? `${i + 1}.` : "-";
    const content = gatherChildren(listItem.children, nodes);
    yield `${prefix} ${content}`;
  }

  yield "";
}

export function* serializeRawNode(node: MOMRaw) {
  yield node.value;
  yield "";
}

const serializersMap = {
  heading: serializeHeadingNode,
  paragraph: serializeParagraphNode,
  blockquote: serializeBlockquoteNode,
  alert: serializeAlertNode,
  code: serializeCodeNode,
  image: serializeImageNode,
  thematicBreak: serializeThematicBreakNode,
  raw: serializeRawNode,
  list: serializeListNode,
} as const;

function* serializer(rootOrder: Array<string>, nodes: MOMMap) {
  for (const id of rootOrder) {
    const node = nodes[id];

    if (!node) continue;

    switch (node.type) {
      case "heading": {
        const nodeSerializer = serializersMap[node.type];
        yield* nodeSerializer(node);
        break;
      }
      case "paragraph": {
        const nodeSerializer = serializersMap[node.type];
        yield* nodeSerializer(node, nodes);
        break;
      }
      case "blockquote": {
        const nodeSerializer = serializersMap[node.type];
        yield* nodeSerializer(node, nodes);
        break;
      }
      case "alert": {
        const nodeSerializer = serializersMap[node.type];
        yield* nodeSerializer(node, nodes);
        break;
      }
      case "code": {
        const nodeSerializer = serializersMap[node.type];
        yield* nodeSerializer(node);
        break;
      }
      case "thematicBreak": {
        const nodeSerializer = serializersMap[node.type];
        yield* nodeSerializer();
        break;
      }
      case "image": {
        const nodeSerializer = serializersMap[node.type];
        yield* nodeSerializer(node);
        break;
      }
      case "list": {
        const nodeSerializer = serializersMap[node.type];
        yield* nodeSerializer(node, nodes);
        break;
      }
      case "raw": {
        const nodeSerializer = serializersMap[node.type];
        yield* nodeSerializer(node);
        break;
      }
    }
  }
}

export const Serializer = {
  momToMarkdown,
  momToHTML,
} as const;
