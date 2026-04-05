import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MOMAllContent, MOMDocument } from "../../mom/types";
import { type BatchOp, type MOMOperation } from "../../mom/engine/engine.types";
import { MOM } from "../../mom";
import type { AppThunk } from "../config";

type UndoStack = {
  past: MOMOperation[];
  future: MOMOperation[];
};

type InitialState = {
  doc: MOMDocument;
  history: UndoStack;
  /** возможно нигде не используется, рассмотреть вариант удаления */
  dirty: boolean;
  copiedNode: MOMAllContent | undefined;
};

const pNode = MOM.Engine.createParagraph(null);
const textNode1 = MOM.Engine.createText("1 part of text,", pNode.id);
const textNode2 = MOM.Engine.createText(" 2 part of text", pNode.id);
const textNode3 = MOM.Engine.createText(" 3 part", pNode.id);
pNode.children = [textNode1.id, textNode2.id, textNode3.id];

const initialState: InitialState = {
  doc: {
    rootOrder: [],
    nodes: {},
    groups: {},
  },
  history: { past: [], future: [] },
  dirty: false,
  copiedNode: undefined,
};

const MAX_HISTORY_DEPTH = 100;

function commitResult(
  state: InitialState,
  result: { doc: MOMDocument; op: MOMOperation },
) {
  state.doc = result.doc;

  state.history.future = [];

  state.history.past.push(result.op);

  if (state.history.past.length > MAX_HISTORY_DEPTH) {
    state.history.past.shift();
  }

  state.dirty = true;
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
      }>,
    ) => {
      const { afterNodeId, ...payload } = action.payload;
      const index = afterNodeId
        ? state.doc.rootOrder.indexOf(afterNodeId) + 1
        : state.doc.rootOrder.length;

      const result = MOM.Engine.insertNode({
        doc: state.doc,
        ...payload,
        index,
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
        ops: action.payload.ops.map((o) => ({
          ...o,
          index: o.index ?? state.doc.rootOrder.length,
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
      state.dirty = true;
    },
    redo: (state) => {
      const op = state.history.future.pop();
      if (!op) return;

      state.doc = MOM.Engine.applyOp({ doc: state.doc, op });

      state.history.past.push(op);
      state.dirty = true;
    },
    markSaved: (state) => {
      state.dirty = false;
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

    copyNode: (state, action: PayloadAction<MOMAllContent | undefined>) => {
      state.copiedNode = action.payload;
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

export const documentStoreActions = documentSlice.actions;
