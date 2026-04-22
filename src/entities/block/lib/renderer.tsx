import { MOM } from "@/mom";
import type { MOMAllContent, MOMBlockNode } from "@/mom/types";
import { ParagraphNode } from "../ui/ParagraphNode/ParagraphNode";
import { HeadingNode } from "../ui/HeadingNode/HeadingNode";
import { ListNode } from "../ui/ListNode/ListNode";
import { BlockquoteNode } from "../ui/BlockquoteNode/BlockquoteNode";
import { AlertNode } from "../ui/AlertNode/AlertNode";
import { CodeNode } from "../ui/CodeNode/CodeNode";
import { ImageNode } from "../ui/ImageNode/ImageNode";
import { RawNode } from "../ui/RawNode/RawNode";
import { ThematicBreakNode } from "../ui/ThematicBreakNode/ThematicBreakNode";

/** Основная функци рендерер */
export function renderer(node: MOMAllContent) {
  if (MOM.Guard.isBlockNode(node)) {
    return renderBlock(node);
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
    case "raw":
      return <RawNode nodeId={node.id} />;
    case "thematicBreak":
      return <ThematicBreakNode nodeId={node.id} />;
    default:
      return null;
  }
}