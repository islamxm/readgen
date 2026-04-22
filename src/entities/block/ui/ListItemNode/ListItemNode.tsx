import { useChildren, useNode } from "@/hooks";
import { type FC } from "react";
import { useListEditor } from "../../lib/useListEditor";
import { MOM } from "@/mom";
import { FormatToolbar } from "../FormatToolbar/FormatToolbar";


type Props = {
  nodeId: string;
  index: number;
  listNodeId: string;
  createItem: (...args: any[]) => void;
  deleteItem: (...args: any[]) => void;
  focusItem: (index: number) => void;
};

export const ListItemNode: FC<Props> = ({
  nodeId,
  index,
  listNodeId,
  createItem,
  deleteItem,
  focusItem,
}) => {
  const children = useChildren(nodeId);
  const { ref, editorProps, applyFormat } = useListEditor(
    nodeId,
    listNodeId,
    children,
    index,
    createItem,
    deleteItem,
    focusItem,
  );
  const node = useNode(nodeId);
  const isValidNode = MOM.Guard.isListItemNode(node);

  if (!isValidNode) return null;

  return (
    <>
      <FormatToolbar containerRef={ref as any} applyFormat={applyFormat} />
      <li
        ref={ref}
        {...editorProps}
        data-id={node.id}
        data-type={node.type}
        data-parent-id={node.parentId ?? ""}
      />
    </>
  );
};
