import { useDocumentActions, useSelectionActions } from "@/hooks";
import { MOM } from "@/mom";
import type { MOMAlert, MOMHeading } from "@/mom/types";

export function useCreateBlock() {
  const { insertNode, insertNodes } = useDocumentActions();
  const { selectAndFocusNode, focuseNode, selectNode } = useSelectionActions();

  const createParagraph = () => {
    const node = MOM.Engine.createParagraph();
    insertNode({
      node,
      parentId: null,
    });
    selectAndFocusNode(node.id);
  };

  const createHeading = (depth?: MOMHeading["depth"]) => {
    const node = MOM.Engine.createHeading(depth ?? 1);
    insertNode({
      node,
      parentId: null,
    });
    selectAndFocusNode(node.id);
  };

  const createBlockquote = () => {
    const node = MOM.Engine.createBlockquote();
    insertNode({
      node,
      parentId: null,
    });
    selectAndFocusNode(node.id);
  };

  const createAlert = (variant?: MOMAlert["variant"]) => {
    const node = MOM.Engine.createAlert(null, variant);
    insertNode({
      node,
      parentId: null,
    });
    selectAndFocusNode(node.id);
  };

  const createCode = () => {
    const node = MOM.Engine.createCode();
    insertNode({
      node,
      parentId: null,
    });
    selectAndFocusNode(node.id);
  };

  const createList = (isOrdered?: boolean) => {
    const listNode = MOM.Engine.createList(isOrdered);
    const listItemNode = MOM.Engine.createListItem(listNode.id);

    insertNodes([
      { node: listNode, parentId: null },
      { node: listItemNode, parentId: listNode.id, index: 0 },
    ]);

    selectNode(listNode.id);
    focuseNode(listItemNode.id);
  };

  const createImage = () => {
    const node = MOM.Engine.createImage();
    insertNode({
      node,
      parentId: null,
    });
    selectAndFocusNode(node.id);
  };

  const createBreak = () => {
    const node = MOM.Engine.createThematicBreak();
    insertNode({
      node,
      parentId: null,
    });
    selectAndFocusNode(node.id);
  };

  const createRaw = () => {
    const node = MOM.Engine.createRaw();
    insertNode({
      node,
      parentId: null,
    });
    selectAndFocusNode(node.id);
  };

  return {
    createHeading,
    createParagraph,
    createBlockquote,
    createAlert,
    createList,
    createBreak,
    createImage,
    createCode,
    createRaw,
  };
}
