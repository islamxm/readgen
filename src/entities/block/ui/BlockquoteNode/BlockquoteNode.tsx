import type { FC } from "react";
import { FormatTextTooltip } from "@features/format-text";
import { useNode } from "@/hooks";
import { useEditor } from "../../lib/useEditor";
import { MOM } from "@/mom";

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
      <FormatTextTooltip containerRef={ref as any} applyFormat={applyFormat} />
      <blockquote
        ref={ref}
        {...editorProps}
        data-id={nodeId}
        data-type={node.type}
        data-parent-id={node.parentId ?? ""}
        data-editable
      />
    </>
  );
};
