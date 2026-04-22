import { type FC } from "react";
import { FormatToolbar } from "../FormatToolbar/FormatToolbar";
import { useNode } from "@/hooks";
import { useEditor } from "../../lib/useEditor";
import { MOM } from "@/mom";

type Props = { nodeId: string };

export const ParagraphNode: FC<Props> = ({ nodeId }) => {
  const node = useNode(nodeId);
  const { ref, editorProps, applyFormat, save } =
    useEditor<HTMLParagraphElement>(node);
  const isValidNode = MOM.Guard.isParagraphNode(node);

  if (!isValidNode) return;

  return (
    <>
      <FormatToolbar
        save={save}
        containerRef={ref as any}
        applyFormat={applyFormat}
      />

      <p
        ref={ref}
        {...editorProps}
        data-id={nodeId}
        data-type={node.type}
        data-parent-id={node.parentId ?? ""}
      />
    </>
  );
};
