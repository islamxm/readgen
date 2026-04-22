import { useEffect, useRef, type FC } from "react";
import { useDocumentActions } from "@/hooks/useDocumentActions";
import { useChildren, useNode, useNodeSelection, useSelectionActions } from "@/hooks";
import { MOM } from "@/mom";
import { ListItemNode } from "../ListItemNode/ListItemNode";
import { saveStateBeforeExternalUpdate } from "../../lib/saveStateBeforeExternalUpdate";

type Props = {
  nodeId: string;
};

export const ListNode: FC<Props> = ({ nodeId }) => {
  const { insertNode, removeNode } = useDocumentActions();
  const node = useNode(nodeId);
  const children = useChildren(nodeId);
  const isValidNode = MOM.Guard.isListNode(node);
  const listRef = useRef<HTMLOListElement & HTMLUListElement>(null);
  const { isSelected, isFocused } = useNodeSelection(nodeId);
  const { focuseNode } = useSelectionActions();

  useEffect(() => {
    if (isSelected && isFocused && children.length > 0) {
      const lastListItemId = children[children.length - 1].id;
      focuseNode(lastListItemId);
    }
  }, [isSelected, isFocused, focuseNode, children]);

  if (!isValidNode) return null;

  const isOrdered = node.ordered;

  const Tag = isOrdered ? "ol" : "ul";

  const focusPrevItem = (e: React.KeyboardEvent, index: number) => {
    if (!listRef.current || children.length === 0) return;
    const canPrev = index !== 0;
    if (canPrev) {
      e.stopPropagation();
      const focusTo = children[index - 1].id;
      focuseNode(focusTo);
    }
  };

  const focusNextItem = (e: React.KeyboardEvent, index: number) => {
    if (!listRef.current || children.length === 0) return;
    const canNext = index !== children.length - 1;
    if (canNext) {
      e.stopPropagation();
      const focusTo = children[index + 1].id;
      focuseNode(focusTo);
    }
  };

  const createItem = (index: number) => {
    saveStateBeforeExternalUpdate(() => {
      const node = MOM.Engine.createListItem(nodeId);
      insertNode({
        node,
        parentId: nodeId,
        index: index + 1,
      });
      setTimeout(() => {
        focuseNode(node.id);
      }, 0);
    });
  };

  const deleteItem = (id: string, index: number) => {
    saveStateBeforeExternalUpdate(() => {
      if (children.length === 1) {
        removeNode(nodeId);
      } else {
        removeNode(id);
      }
      setTimeout(() => {
        focuseNode(children[Math.max(0, index - 1)].id);
      }, 0);
    });
  };

  return (
    <Tag ref={listRef} data-id={node.id} data-type={node.type} data-parent-id={node.parentId ?? ""}>
      {children.map((childNode, childIndex) => (
        <ListItemNode
          key={childNode.id}
          nodeId={childNode.id}
          index={childIndex}
          createItem={() => createItem(childIndex)}
          deleteItem={() => deleteItem(childNode.id, childIndex)}
          listNodeId={nodeId}
          focusPrevItem={focusPrevItem}
          focusNextItem={focusNextItem}
        />
      ))}
    </Tag>
  );
};
