import type { MOMDocument } from "@/mom/types";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppThunk } from "../config";
import { MOM } from "@/mom";

type InitialState = {
  selectedIds: Array<string>;
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
    addToSelection: (state, action: PayloadAction<string>) => {
      if (!state.selectedIds.includes(action.payload)) {
        state.selectedIds.push(action.payload);
        state.focusedId = null;
      }
    },
    selectBatch: (state, action: PayloadAction<MOMDocument["nodes"]>) => {
      state.selectedIds = Object.entries(action.payload).map(([_, v]) => v.id);
    },
    removeFromSelection: (state, action: PayloadAction<string>) => {
      state.selectedIds = state.selectedIds.filter(
        (id) => id !== action.payload,
      );
      state.focusedId = null;
    },
    clearSelection: (state) => {
      state.selectedIds = [];
      state.focusedId = null;
    },
    focusNode: (state, action: PayloadAction<string>) => {
      state.focusedId = action.payload;
    },
    focusNewNode: (state, action: PayloadAction<string>) => {
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
});

export const selectNextBlockThunk =
  (currentNodeId: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    // const { focusedId } = state.selection;
    const { rootOrder } = state.document.doc;

    // if (!focusedId) return;

    const indexOfFocused = rootOrder.indexOf(currentNodeId);

    // Безопасный переход к следующему индексу
    const nextIndex = (indexOfFocused + 1) % rootOrder.length;
    const nextId = rootOrder[nextIndex];

    if (nextId) {
      console.log(nextId);
      // dispatch(selectionStoreActions.selectNode(nextId));
      // dispatch(selectionStoreActions.focusNode(nextId));
      dispatch(selectionStoreActions.focusNewNode(nextId));
    }
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
    if (!node || !MOM.Guard.isRootNode(node)) {
      return;
    }
    dispatch(selectionStoreActions.selectNode(nodeId));
  };

export const selectPrevBlockThunk =
  (currentNodeId: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const rootOrder = state.document.doc.rootOrder;

    const indexOfFocused = rootOrder.indexOf(currentNodeId);
    const prevIndex =
      indexOfFocused - 1 < 0 ? rootOrder.length - 1 : indexOfFocused - 1;
    const targetNodeId = rootOrder[prevIndex];
    dispatch(selectionStoreActions.focusNewNode(targetNodeId));
    // dispatch(selectionStoreActions.selectNode(rootOrder[prevIndex]));
    // dispatch(selectionStoreActions.focusNode(rootOrder[prevIndex]));
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
