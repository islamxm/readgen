import { type FC } from "react";
import { useSelectionActions } from "@/hooks";
import { useNode } from "@/hooks";
import { MOM } from "@/mom";

type Props = {
  nodeId: string;
};

export const ThematicBreakNode: FC<Props> = ({ nodeId }) => {
  const node = useNode(nodeId);
  const isValidNode = MOM.Guard.isThematicBreak(node);
  const { selectNode } = useSelectionActions();

  const onClick = () => {
    selectNode(nodeId);
  };

  if (!isValidNode) return null;

  return (
    <hr
      data-id={node.id}
      data-type={node.type}
      data-parent-id={node.parentId ?? ""}
      onClick={onClick}
    />
  );
};
