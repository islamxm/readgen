import { useChildren, useNode } from "@/hooks";
import { type FC } from "react";
import { useListEditor } from "../../lib/useListEditor";
import { MOM } from "@/mom";
import { FormatTextToolbar } from "@features/format-text";


type Props = {
  nodeId: string;
  index: number;
  listNodeId: string;
  createItem: (...args: any[]) => void;
  deleteItem: (...args: any[]) => void;
  focusPrevItem: (e: React.KeyboardEvent, index: number) => void;
  focusNextItem: (e: React.KeyboardEvent, index: number) => void;
};

export const ListItemNode: FC<Props> = ({
  nodeId,
  index,
  listNodeId,
  createItem,
  deleteItem,
  focusPrevItem,
  focusNextItem
}) => {
  const children = useChildren(nodeId);
  const { ref, editorProps, applyFormat } = useListEditor(
    nodeId,
    listNodeId,
    children,
    index,
    createItem,
    deleteItem,
    focusPrevItem,
    focusNextItem,
  );
  const node = useNode(nodeId);
  const isValidNode = MOM.Guard.isListItemNode(node);

  if (!isValidNode) return null;

  return (
    <>
      <FormatTextToolbar containerRef={ref as any} applyFormat={applyFormat} />
      <li
        ref={ref}
        {...editorProps}
        data-id={node.id}
        data-type={node.type}
        data-parent-id={node.parentId ?? ""}
        data-editable
      />
    </>
  );
};
