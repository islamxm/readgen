import { shortcut, GlobalShortcuts } from "@/utils";
import { useEffect } from "react";
import { useHistory } from "./useHistory";
import { useSelectionActions } from "./useSelectionActions";
import { useDocumentActions } from "./useDocumentActions";
import { useEvent } from "./useEvent";

/** для того чтобы вызвать сохранение активного редактируемого блока перед изменением стейта, нужно вынести в глобальные утилиты потому что может пригодится в других глобальных хуках и функциях */
const saveStateBefore = (cb?: () => void) => {
  const activeEl = document.activeElement;
  if (activeEl && activeEl instanceof HTMLElement && activeEl.dataset.editable) {
    activeEl.blur();
  }
  cb?.();
};

export function useDocumentShortcuts() {
  const { undo, redo } = useHistory();
  const { selectAllBlocks, selectNextBlock, selectPrevBlock } = useSelectionActions();
  const { createNewBlock, deleteSelectedBlocks } = useDocumentActions();

  const onKeyDown = useEvent((e: KeyboardEvent) => {
    shortcut(e, GlobalShortcuts.REDO, () => saveStateBefore(redo), true);
    shortcut(e, GlobalShortcuts.SELECT_ALL_BLOCKS, () => saveStateBefore(selectAllBlocks), true);
    shortcut(e, GlobalShortcuts.DELETE_SELECTED_BLOCKS, () => saveStateBefore(deleteSelectedBlocks), true);
    shortcut(e, GlobalShortcuts.UNDO, () => saveStateBefore(undo), true);
    shortcut(e, GlobalShortcuts.REDO_LEGACY, () => saveStateBefore(redo), true);
    shortcut(e, GlobalShortcuts.SAVE_DOCUMENT, () => saveStateBefore(), true);
    shortcut(e, GlobalShortcuts.SELECT_PREV_BLOCK, () => saveStateBefore(selectPrevBlock), true);
    shortcut(e, GlobalShortcuts.SELECT_NEXT_BLOCK, () => saveStateBefore(selectNextBlock), true);
    shortcut(e, GlobalShortcuts.CREATE_NEW_BLOCK, () => saveStateBefore(createNewBlock), true);
  });

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);
}
