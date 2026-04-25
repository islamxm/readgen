import { createListenerMiddleware, createSlice, isAnyOf, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type { MOMAllContent, MOMDocument } from "../../mom/types";
import { type BatchOp, type EngineResult, type MOMOperation } from "../../mom/engine/engine.types";
import { MOM } from "../../mom";
import type { AppThunk, RootState } from "../config";
import { selectionStoreActions } from "./selectionSlice";
import { groupNodes } from "@/mom/engine/engine";

type UndoStack = {
  past: MOMOperation[];
  future: MOMOperation[];
};

type InitialState = {
  id: string | null;
  doc: MOMDocument;
  history: UndoStack;
  copiedNode: {
    nodeId: string;
    nodes: Array<{ node: MOMAllContent; parentId: string | null }>;
    isPasted: boolean;
  } | null;
};

const pNode = MOM.Engine.createParagraph(null);
const textNode1 = MOM.Engine.createText("1 part of text,", pNode.id);
const textNode2 = MOM.Engine.createText(" 2 part of text", pNode.id);
const textNode3 = MOM.Engine.createText(" 3 part", pNode.id);
pNode.children = [textNode1.id, textNode2.id, textNode3.id];

const initialState: InitialState = {
  id: null,
  doc: {
    rootOrder: [],
    nodes: {},
    groups: {},
  },
  history: { past: [], future: [] },
  copiedNode: null,
};

const MAX_HISTORY_DEPTH = 100;

function commitResult(state: InitialState, result: { doc: MOMDocument; op: MOMOperation }) {
  state.doc = result.doc;
  state.history.future = [];
  state.history.past.push(result.op);

  if (state.history.past.length > MAX_HISTORY_DEPTH) {
    state.history.past.shift();
  }
}

export const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    insertNode: (
      state,
      action: PayloadAction<{
        node: MOMAllContent;
        parentId: string | null;
        afterNodeId?: string;
        index?: number;
      }>,
    ) => {
      const { afterNodeId, index: inpIndex, ...payload } = action.payload;
      const index = afterNodeId ? state.doc.rootOrder.indexOf(afterNodeId) + 1 : state.doc.rootOrder.length;

      const result = MOM.Engine.insertNode({
        doc: state.doc,
        ...payload,
        index: inpIndex ?? index,
      });
      commitResult(state, result);
    },
    insertNodes: (
      state,
      action: PayloadAction<{
        ops: Array<{
          node: MOMAllContent;
          parentId: string | null;
          index?: number;
        }>;
      }>,
    ) => {
      const result = MOM.Engine.insertNodes({
        doc: state.doc,
        ops: action.payload.ops.map((o, ind) => ({
          ...o,
          index: o.index ?? state.doc.rootOrder.length + ind,
        })),
      });

      commitResult(state, result);
    },
    removeNode: (
      state,
      action: PayloadAction<{
        nodeId: string;
      }>,
    ) => {
      const result = MOM.Engine.removeNode({
        doc: state.doc,
        ...action.payload,
      });
      commitResult(state, result);
    },
    removeNodes: (state, action: PayloadAction<Array<string>>) => {
      const result = MOM.Engine.removeNodes({
        doc: state.doc,
        nodeIds: action.payload,
      });
      commitResult(state, result);
    },
    updateNode: (
      state,
      action: PayloadAction<{
        nodeId: string;
        patch: Partial<MOMAllContent>;
      }>,
    ) => {
      const result = MOM.Engine.updateNode({
        doc: state.doc,
        ...action.payload,
      });
      commitResult(state, result);
    },
    moveNode: (
      state,
      action: PayloadAction<{
        nodeId: string;
        toParentId: string | null;
        toIndex: number;
      }>,
    ) => {
      const result = MOM.Engine.moveNode({
        doc: state.doc,
        ...action.payload,
      });
      commitResult(state, result);
    },
    groupNodes: (
      state,
      action: PayloadAction<{
        nodeIds: string[];
        label: string;
      }>,
    ) => {
      const result = MOM.Engine.groupNodes({
        doc: state.doc,
        ...action.payload,
      });
      commitResult(state, result);
    },
    ungroupNodes: (
      state,
      action: PayloadAction<{
        groupId: string;
      }>,
    ) => {
      const result = MOM.Engine.ungroupNodes({
        doc: state.doc,
        ...action.payload,
      });
      commitResult(state, result);
    },
    renameGroup: (
      state,
      action: PayloadAction<{
        groupId: string;
        label: string;
      }>,
    ) => {
      const result = MOM.Engine.renameGroup({
        doc: state.doc,
        ...action.payload,
      });
      commitResult(state, result);
    },
    undo: (state) => {
      const op = state.history.past.pop();
      if (!op) return;

      const invertedOp = MOM.Engine.invertOp(op);
      state.doc = MOM.Engine.applyOp({ doc: state.doc, op: invertedOp });

      state.history.future.push(op);
    },
    redo: (state) => {
      const op = state.history.future.pop();
      if (!op) return;

      state.doc = MOM.Engine.applyOp({ doc: state.doc, op });

      state.history.past.push(op);
    },

    commitInlineEdit: (
      state,
      action: PayloadAction<{
        nodeId: string;
        nodes: Array<MOMAllContent>;
      }>,
    ) => {
      const { nodeId, nodes } = action.payload;
      const doc = state.doc;

      const ops: Array<MOMOperation> = [];
      let currentDoc = doc;

      const parentNode = currentDoc.nodes[nodeId];
      if ("children" in parentNode) {
        const oldChildIds = parentNode.children as string[];
        oldChildIds.forEach((childId) => {
          const result = MOM.Engine.removeNode({
            doc: currentDoc,
            nodeId: childId,
          });
          currentDoc = result.doc;
          ops.push(result.op);
        });
      }

      nodes.forEach((node, index) => {
        const result = MOM.Engine.insertNode({
          doc: currentDoc,
          node: node as MOMAllContent,
          parentId: nodeId,
          index,
        });
        currentDoc = result.doc;
        ops.push(result.op);
      });

      const batchOp: BatchOp = { type: "batch", ops };
      commitResult(state, { doc: currentDoc, op: batchOp });
    },

    copyNode: (state, action: PayloadAction<InitialState["copiedNode"]>) => {
      state.copiedNode = action.payload;
    },

    copyPasted: (state) => {
      if (state.copiedNode) {
        state.copiedNode.isPasted = true;
      }
    },

    updateRootOrder: (state, action: PayloadAction<Array<string>>) => {
      state.doc.rootOrder = action.payload;
    },

    clearDocument: (state) => {
      state.doc.groups = {};
      state.doc.nodes = {};
      state.doc.rootOrder = [];
      state.history = { past: [], future: [] };
      state.copiedNode = null;
    },

    initiateDocument: (state, action: PayloadAction<{ doc: MOMDocument; id: string }>) => {
      state.doc = action.payload.doc;
      state.id = action.payload.id;
      state.history.future = [];
      state.history.past = [];
      state.copiedNode = null;
    },
    uninitiateDocument: (state) => {
      state.doc.nodes = {};
      state.doc.groups = {};
      state.doc.rootOrder = [];
      state.id = null;
      state.history.future = [];
      state.history.past = [];
      state.copiedNode = null;
    },
  },
});

export const addLinkThunk =
  (url: string, linkId: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const node = state.document.doc.nodes[linkId];
    if (!MOM.Guard.isTextNode(node)) return;
    dispatch(
      documentStoreActions.updateNode({
        nodeId: linkId,
        patch: { ...node, url },
      }),
    );
  };

export const createNewBlockThunk = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const rootOrder = state.document.doc.rootOrder;
  const selectedId = state.selection.selectedIds[0];
  if (!selectedId) return;

  const currentNode = state.document.doc.nodes[selectedId];
  if (!currentNode) return;

  const type = currentNode.type;
  const id = nanoid();

  switch (type) {
    case "paragraph":
      dispatch(
        documentStoreActions.insertNode({
          node: { ...MOM.Engine.createParagraph(currentNode.parentId), id },
          parentId: null,
          afterNodeId: currentNode.id,
        }),
      );
      break;
    case "blockquote":
      dispatch(
        documentStoreActions.insertNode({
          node: { ...MOM.Engine.createBlockquote(currentNode.parentId), id },
          parentId: null,
          afterNodeId: currentNode.id,
        }),
      );
      break;
    case "heading":
      dispatch(
        documentStoreActions.insertNode({
          node: {
            ...MOM.Engine.createHeading(currentNode.depth, currentNode.parentId),
            id,
          },
          parentId: null,
          afterNodeId: currentNode.id,
        }),
      );
      break;
    case "alert":
      dispatch(
        documentStoreActions.insertNode({
          node: {
            ...MOM.Engine.createAlert(currentNode.parentId, currentNode.variant),
            id,
          },
          parentId: null,
          afterNodeId: currentNode.id,
        }),
      );
      break;
    case "list": {
      const listNode = MOM.Engine.createList(currentNode.ordered);
      const listItemNode = MOM.Engine.createListItem(listNode.id);
      const index = rootOrder.indexOf(selectedId) + 1;
      dispatch(
        documentStoreActions.insertNodes({
          ops: [
            { node: { ...listNode, id }, parentId: null, index },
            { node: { ...listItemNode, parentId: id }, parentId: id },
          ],
        }),
      );
      break;
    }
  }
  dispatch(selectionStoreActions.selectAndFocusNode(id));
};

export const deleteSelectedBlocksThunk = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const selectedIds = state.selection.selectedIds;
  const rootOrder = state.document.doc.rootOrder;

  if (selectedIds.length === 0) return;
  dispatch(documentStoreActions.removeNodes(selectedIds));

  if (rootOrder.length === selectedIds.length) return;

  const firstSelectedIndex = rootOrder.indexOf(selectedIds[0]);
  const lastSelectedIndex = rootOrder.indexOf(selectedIds[selectedIds.length - 1]);

  const newSelectId = firstSelectedIndex === 0 ? rootOrder[lastSelectedIndex + 1] : rootOrder[firstSelectedIndex - 1];

  dispatch(selectionStoreActions.selectAndFocusNode(newSelectId));
};

export const copyNodeThunk =
  (nodeId?: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const nodes = state.document.doc.nodes;

    const copyId = nodeId ?? state.selection.selectedIds[0];
    if (!copyId) return;

    const rootNode = nodes[copyId];

    const result = MOM.Editor.copyNode(nodes, rootNode);

    dispatch(documentStoreActions.copyNode({ nodeId: copyId, nodes: result, isPasted: false }));
  };

export const pasteNodeThunk = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const copyData = state.document.copiedNode;
  if (!copyData) return;
  const copiedNode = state.document.doc.nodes[copyData.nodeId];
  let copiedNodes = state.document.copiedNode?.nodes;

  if (copyData.isPasted) {
    copiedNodes = MOM.Editor.copyNode(state.document.doc.nodes, copiedNode);
  }

  if (!copiedNodes || copiedNodes.length === 0) return;

  dispatch(documentStoreActions.insertNodes({ ops: copiedNodes }));
  dispatch(documentStoreActions.copyPasted());
};

export const documentStorageListener = createListenerMiddleware();
documentStorageListener.startListening({
  matcher: isAnyOf(
    documentSlice.actions.insertNode,
    documentSlice.actions.insertNodes,
    documentSlice.actions.removeNode,
    documentSlice.actions.removeNodes,
    documentSlice.actions.updateNode,
    documentSlice.actions.moveNode,
    documentSlice.actions.groupNodes,
    documentSlice.actions.ungroupNodes,
    documentSlice.actions.renameGroup,
    documentSlice.actions.undo,
    documentSlice.actions.redo,
    documentSlice.actions.commitInlineEdit,
    documentSlice.actions.updateRootOrder,
    documentSlice.actions.clearDocument,
  ),
  effect: async (_, listenerApi) => {
    listenerApi.cancelActiveListeners();
    const state = listenerApi.getState() as RootState;
    const doc = state.document.doc;
    const id = state.document.id;

    if (!(doc && id)) return;
    await MOM.Storage.updateDocument(id, {
      ...doc,
      lastModified: Date.now(),
    });
  },
});

export const documentStoreActions = documentSlice.actions;
