import { type FC } from "react";
import { useNode } from "@/hooks";
import { useEditor } from "../../lib/useEditor";
import { MOM } from "@/mom";
import { FormatTextTooltip } from "@features/format-text";

type Props = { nodeId: string };

export const ParagraphNode: FC<Props> = ({ nodeId }) => {
  const node = useNode(nodeId);
  const { ref, editorProps, applyFormat } = useEditor<HTMLParagraphElement>(node);
  const isValidNode = MOM.Guard.isParagraphNode(node);

  if (!isValidNode) return;

  return (
    <>
      <FormatTextTooltip containerRef={ref as any} applyFormat={applyFormat} />

      <p ref={ref} {...editorProps} data-id={nodeId} data-type={node.type} data-parent-id={node.parentId ?? ""} data-editable />
    </>
  );
};
