import { useRef, type FC } from "react";
import { useDocumentActions } from "@/hooks/useDocumentActions";
import { useChildren, useNode } from "@/hooks";
import { MOM } from "@/mom";
import { ListItemNode } from "../ListItemNode/ListItemNode";

type Props = {
  nodeId: string;
};

export const ListNode: FC<Props> = ({ nodeId }) => {
  const { insertNode, removeNode } = useDocumentActions();
  const node = useNode(nodeId);
  const children = useChildren(nodeId);
  const isValidNode = MOM.Guard.isListNode(node);
  const listRef = useRef<HTMLOListElement & HTMLUListElement>(null);

  if (!isValidNode) return null;

  const isOrdered = node.ordered;

  const Tag = isOrdered ? "ol" : "ul";

  const focusItem = (index: number) => {
    if (!listRef.current) return;
    const children = listRef.current.children;
    if (children.length === 0) return;
    const targetEl = children.item(index);
    if (!targetEl) return;
    if (targetEl instanceof HTMLElement) {
      targetEl.focus();
      const range = document.createRange();
      range.selectNodeContents(targetEl);
      range.collapse(false);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  const createItem = (index: number) => {
    insertNode({
      node: MOM.Engine.createListItem(nodeId),
      parentId: nodeId,
      index: index + 1,
    });
    requestAnimationFrame(() => focusItem(index + 1));
  };

  const deleteItem = (id: string, index: number) => {
    if (children.length === 1) {
      removeNode(nodeId);
      return;
    }
    removeNode(id);
    requestAnimationFrame(() => focusItem(Math.max(0, index - 1)));
  };

  return (
    <Tag
      ref={listRef}
      data-id={node.id}
      data-type={node.type}
      data-parent-id={node.parentId ?? ""}
    >
      {children.map((childNode, childIndex) => (
        <ListItemNode
          key={childNode.id}
          nodeId={childNode.id}
          index={childIndex}
          createItem={() => createItem(childIndex)}
          deleteItem={() => deleteItem(childNode.id, childIndex)}
          focusItem={focusItem}
          listNodeId={nodeId}
        />
      ))}
    </Tag>
  );
};
