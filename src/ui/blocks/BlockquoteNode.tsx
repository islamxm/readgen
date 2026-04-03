import type { FC } from "react";
import { useEditor, useNode } from "../../hooks";
import { MOM } from "../../mom";
import { FormatToolbar } from "../FormatToolbar/FormatToolbar";

type Props = {
  nodeId: string;
};
export const BlockquoteNode: FC<Props> = ({ nodeId }) => {
  const node = useNode(nodeId);
  const { editorProps, ref, applyFormat } = useEditor<HTMLQuoteElement>(node);
  const isValidNode = MOM.Guard.isBlockquoteNode(node);

  if (!isValidNode) return null;

  return (
    <>
      <FormatToolbar containerRef={ref as any} applyFormat={applyFormat} />
      <blockquote
        ref={ref}
        {...editorProps}
        data-id={nodeId}
        data-type={node.type}
        data-parent-id={node.parentId ?? ""}
      />
    </>
  );
};
