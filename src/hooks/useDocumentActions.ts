import type { MOMAllContent } from "@/mom/types";
import { useDispatch } from "@/shared/lib";
import {
  addLinkThunk,
  documentStoreActions,
} from "@/store/slices/documentSlice";

/** Обертка над document slice - только для set */
export function useDocumentActions() {
  const dispatch = useDispatch();

  function insertNode(opt: {
    node: MOMAllContent;
    parentId: string | null;
    index?: number;
    afterNodeId?: string;
  }) {
    dispatch(documentStoreActions.insertNode(opt));
  }

  function insertNodes(
    ops: Array<{
      node: MOMAllContent;
      parentId: string | null;
      index?: number;
    }>,
  ) {
    const readyOps = ops.map((o) => ({
      ...o,
      index: o.index,
    }));
    dispatch(documentStoreActions.insertNodes({ ops: readyOps }));
  }

  function removeNode(nodeId: string) {
    dispatch(documentStoreActions.removeNode({ nodeId }));
  }

  function updateNode<T extends Partial<MOMAllContent>>(opt: {
    nodeId: string;
    patch: T;
  }) {
    dispatch(documentStoreActions.updateNode(opt));
  }

  function moveNode(opt: {
    nodeId: string;
    toParentId: string | null;
    toIndex: number;
  }) {
    dispatch(documentStoreActions.moveNode(opt));
  }

  function groupNodes(opt: { nodeIds: Array<string>; label: string }) {
    dispatch(documentStoreActions.groupNodes(opt));
  }

  function ungroupNodes(groupId: string) {
    dispatch(documentStoreActions.ungroupNodes({ groupId }));
  }

  function renameGroup(opt: { groupId: string; label: string }) {
    dispatch(documentStoreActions.renameGroup(opt));
  }

  function commitInlineEdit(opt: { nodeId: string; nodes: MOMAllContent[] }) {
    dispatch(documentStoreActions.commitInlineEdit(opt));
  }

  /** очень странное необоснованное расположение - надо ближе к компоненту расположить, пока пусть будет тут */
  function addLink(url: string, linkId: string) {
    dispatch(addLinkThunk(url, linkId));
  }

  function copyNode(node: MOMAllContent | undefined) {
    dispatch(documentStoreActions.copyNode(node));
  }

  function clearDocument() {
    dispatch(documentStoreActions.clearDocument());
  }

  return {
    insertNode,
    insertNodes,
    removeNode,
    updateNode,
    moveNode,
    groupNodes,
    ungroupNodes,
    renameGroup,
    addLink,
    commitInlineEdit,
    copyNode,
    clearDocument
  };
}
