import { MOM } from "../mom";
import type { MOMAllContent, MOMBlockNode, MOMInlineNode } from "../mom/types";
import {
  ListNode,
  ThematicBreakNode,
  ParagraphNode,
  HeadingNode,
  CodeNode,
  ImageNode,
} from "./blocks";
import { AlertNode } from "./blocks/AlertNode";
import { BlockquoteNode } from "./blocks/BlockquoteNode";
import { ListItemNode, TextNode } from "./inlines";

/** Основная функци рендерер */
export function renderer(node: MOMAllContent) {
  if (MOM.Guard.isBlockNode(node)) {
    return renderBlock(node);
  }
  if (MOM.Guard.isInlineNode(node)) {
    return renderInline(node);
  }
  return null;
}

/** Функция для рендера топ-левел блоков */
function renderBlock(node: MOMBlockNode) {
  switch (node.type) {
    case "paragraph":
      return <ParagraphNode nodeId={node.id} />;
    case "heading":
      return <HeadingNode nodeId={node.id} />;
    case "list":
      return <ListNode nodeId={node.id} />;
    case "blockquote":
      return <BlockquoteNode nodeId={node.id} />;
    case "alert":
      return <AlertNode nodeId={node.id} />;
    case "code":
      return <CodeNode nodeId={node.id} />;
    case "image":
      return <ImageNode nodeId={node.id} />;
    case "thematicBreak":
      return <ThematicBreakNode nodeId={node.id} />;
    default:
      return null;
  }
}

/** Функция для рендера составных частей топ-левел блоков */
function renderInline(node: MOMInlineNode) {
  switch (node.type) {
    case "listItem":
      return <ListItemNode nodeId={node.id} />;
    case "paragraph":
      return <ParagraphNode nodeId={node.id} />;
    case "text":
      return <TextNode nodeId={node.id} />;
    case "inlineCode":
      return null;
    default:
      return null;
  }
}
