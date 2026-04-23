import type { MOMDocument } from "@/mom/types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppThunk } from "../config";
import { MOM } from "@/mom";
import { documentStoreActions } from "./documentSlice";

type InitialState = {
  // выбранный блок
  selectedIds: Array<string>;
  // редактируемый блок
  focusedId: string | null;
};

const initialState: InitialState = {
  selectedIds: [],
  focusedId: null,
};

export const selectionSlice = createSlice({
  name: "selection",
  initialState,
  reducers: {
    selectNode: (state, action: PayloadAction<string>) => {
      state.selectedIds = [action.payload];
    },
    selectBatch: (state, action: PayloadAction<MOMDocument["nodes"]>) => {
      state.selectedIds = Object.entries(action.payload).map(([_, v]) => v.id);
    },
    addToSelection: (state, action: PayloadAction<string>) => {
      if (!state.selectedIds.includes(action.payload)) {
        state.selectedIds.push(action.payload);
        state.focusedId = null;
      }
    },
    removeFromSelection: (state, action: PayloadAction<string>) => {
      state.selectedIds = state.selectedIds.filter((id) => id !== action.payload);
      state.focusedId = null;
    },
    clearSelection: (state) => {
      state.selectedIds = [];
      state.focusedId = null;
    },
    focusNode: (state, action: PayloadAction<string>) => {
      state.focusedId = action.payload;
    },
    selectAndFocusNode: (state, action: PayloadAction<string>) => {
      state.focusedId = action.payload;
      state.selectedIds = [action.payload];
    },
    blurNode: (state) => {
      state.focusedId = null;
    },
    clearAllSelection: (state) => {
      state.selectedIds = [];
      state.focusedId = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(documentStoreActions.initiateDocument, (state) => {
      state.focusedId = null;
      state.selectedIds = [];
    });
  },
});

export const selectNextBlockThunk = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const rootOrder = state.document.doc.rootOrder;
  const selectedId = state.selection.selectedIds[0];

  if (rootOrder.length === 0) return;

  let targetNodeId;

  if (!selectedId) {
    targetNodeId = rootOrder[0];
  } else {
    const selectedIndex = rootOrder.indexOf(selectedId);
    if (selectedIndex === rootOrder.length - 1) {
      targetNodeId = rootOrder[0];
    } else {
      targetNodeId = rootOrder[selectedIndex + 1];
    }
  }
  if (!targetNodeId) return;
  dispatch(selectionStoreActions.selectAndFocusNode(targetNodeId));
};

export const selectPrevBlockThunk = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const rootOrder = state.document.doc.rootOrder;
  const selectedId = state.selection.selectedIds[0];

  if (rootOrder.length === 0) return;

  let targetNodeId;

  if (!selectedId) {
    targetNodeId = rootOrder[0];
  } else {
    const selectedIndex = rootOrder.indexOf(selectedId);
    if (selectedIndex === 0) {
      targetNodeId = rootOrder[rootOrder.length - 1];
    }
    if (selectedIndex > 0) {
      targetNodeId = rootOrder[selectedIndex - 1];
    }
  }

  if (!targetNodeId) return;
  dispatch(selectionStoreActions.selectAndFocusNode(targetNodeId));
};

export const addToSelectionThunk =
  (nodeId: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const selectedIds = state.selection.selectedIds;
    const nodes = state.document.doc.nodes;
    const node = state.document.doc.nodes[nodeId];

    if (!node || !MOM.Guard.isRootNode(node)) {
      return;
    }

    if (selectedIds.length > 0) {
      const firstNode = nodes[selectedIds[0]];
      const targetNode = nodes[nodeId];
      if (firstNode?.groupId !== targetNode?.groupId) {
        console.warn("нельзя выбирать ноды из разных групп");
        return;
      }
    }
    dispatch(selectionStoreActions.addToSelection(nodeId));
  };

export const selectNodeThunk =
  (nodeId: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const node = state.document.doc.nodes[nodeId];
    const isAlsoSelected = state.selection.selectedIds.length === 1 && state.selection.selectedIds[0] === nodeId;
    if (!node || !MOM.Guard.isRootNode(node) || isAlsoSelected) {
      return;
    }
    dispatch(selectionStoreActions.selectNode(nodeId));
  };

export const selectAllBlocksThunk = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const nodes = state.document.doc.nodes;
  dispatch(selectionStoreActions.selectBatch(nodes));
};

export const focusNodeThunk =
  (nodeId: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const focusedId = state.selection.focusedId;
    if (focusedId === nodeId) return;
    dispatch(selectionStoreActions.focusNode(nodeId));
  };

export const selectionStoreActions = selectionSlice.actions;
