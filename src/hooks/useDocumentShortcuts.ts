import { shortcut, GlobalShortcuts } from "@shared/lib";
import { useEffect } from "react";
import { useHistory } from "./useHistory";
import { useSelectionActions } from "./useSelectionActions";
import { useDocumentActions } from "./useDocumentActions";
import { useEvent } from "./useEvent";
import { saveStateBeforeExternalUpdate } from "@entities/block";

export function useDocumentShortcuts() {
  const { undo, redo } = useHistory();
  const { selectAllBlocks, selectNextBlock, selectPrevBlock } = useSelectionActions();
  const { createNewBlock, deleteSelectedBlocks, copyNode, pasteNode } = useDocumentActions();

  const onKeyDown = useEvent((e: KeyboardEvent) => {
    shortcut(e, GlobalShortcuts.REDO, () => saveStateBeforeExternalUpdate(redo), true);
    shortcut(e, GlobalShortcuts.SELECT_ALL_BLOCKS, () => saveStateBeforeExternalUpdate(selectAllBlocks), true);
    shortcut(e, GlobalShortcuts.DELETE_SELECTED_BLOCKS, () => saveStateBeforeExternalUpdate(deleteSelectedBlocks), true);
    shortcut(e, GlobalShortcuts.COPY_NODE, () => saveStateBeforeExternalUpdate(copyNode), true);
    shortcut(e, GlobalShortcuts.PASTE_NODE, () => saveStateBeforeExternalUpdate(pasteNode), true);
    shortcut(e, GlobalShortcuts.UNDO, () => saveStateBeforeExternalUpdate(undo), true);
    shortcut(e, GlobalShortcuts.REDO_LEGACY, () => saveStateBeforeExternalUpdate(redo), true);
    shortcut(e, GlobalShortcuts.SAVE_DOCUMENT, () => saveStateBeforeExternalUpdate(), true);
    shortcut(e, GlobalShortcuts.SELECT_PREV_BLOCK, () => saveStateBeforeExternalUpdate(selectPrevBlock), true);
    shortcut(e, GlobalShortcuts.SELECT_NEXT_BLOCK, () => saveStateBeforeExternalUpdate(selectNextBlock), true);
    shortcut(e, GlobalShortcuts.CREATE_NEW_BLOCK, () => saveStateBeforeExternalUpdate(createNewBlock), true);
  });

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);
}
