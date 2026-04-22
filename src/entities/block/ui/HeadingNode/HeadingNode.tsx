import { useNode } from "@/hooks";
import type { FC } from "react";
import { useEditor } from "../../lib/useEditor";
import { MOM } from "@/mom";

type TagType = React.ElementType<
  React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> }
>;
type Props = { nodeId: string };

export const HeadingNode: FC<Props> = ({ nodeId }) => {
  const node = useNode(nodeId);
  const { editorProps, ref } = useEditor<HTMLHeadingElement>(
    node,
    "plain",
    true,
  );
  const isValidNode = MOM.Guard.isHeadingNode(node);

  if (!isValidNode) return null;

  const Tag = `h${node.depth}` as TagType;

  return (
    <Tag
      ref={ref}
      {...editorProps}
      data-id={nodeId}
      data-type={node.type}
      data-parent-id={node.parentId ?? ""}
    />
  );
};
