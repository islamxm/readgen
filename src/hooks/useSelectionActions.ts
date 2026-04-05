import { useDispatch } from "@/shared/lib";
import {
  selectAllBlocksThunk,
  selectionStoreActions,
  selectNextBlockThunk,
  addToSelectionThunk,
  selectNodeThunk,
  selectPrevBlockThunk,
  focusNodeThunk,
} from "@/store/slices/selectionSlice";

export function useSelectionActions() {
  const dispatch = useDispatch();

  function selectNode(nodeId: string) {
    dispatch(selectNodeThunk(nodeId));
  }

  function addToSelect(nodeId: string) {
    dispatch(addToSelectionThunk(nodeId));
  }

  function removeFromSelect(nodeId: string) {
    dispatch(selectionStoreActions.removeFromSelection(nodeId));
  }

  function clearAllSelection() {
    dispatch(selectionStoreActions.clearAllSelection());
  }

  function selectNextBlock(currentNodeId: string) {
    dispatch(selectNextBlockThunk(currentNodeId));
  }

  function selectPrevBlock(currentNodeId: string) {
    dispatch(selectPrevBlockThunk(currentNodeId));
  }

  function selectAllBlocks() {
    dispatch(selectAllBlocksThunk());
  }

  function focuseNode(nodeId: string) {
    dispatch(focusNodeThunk(nodeId));
  }

  function focusNewNode(nodeId: string) {
    dispatch(selectionStoreActions.focusNewNode(nodeId));
  }

  function blur() {
    dispatch(selectionStoreActions.blurNode());
  }

  return {
    selectNode,
    addToSelect,
    removeFromSelect,
    clearAllSelection,
    selectNextBlock,
    selectPrevBlock,
    selectAllBlocks,
    focuseNode,
    focusNewNode,
    blur,
  };
}
