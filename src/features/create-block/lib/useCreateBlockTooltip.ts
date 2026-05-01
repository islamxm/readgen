import { useDispatch } from "@shared/lib";
import { uiStoreActions } from "@/store/slices/uiSlice";
import { CREATE_BLOCK_INLINE_TOOLTIP_ID } from "../model/consts";
import { useRef } from "react";

export function useCreateBlockTooltip() {
  const dispatch = useDispatch();
  const acc = useRef<Array<string>>([]);

  function handle(e: KeyboardEvent) {
    const inEditableBlock = e.target instanceof Element && e.target.closest("[data-editable]");

    if (!inEditableBlock) return;

    const isTooltipOpen = !!document.querySelector(`#${CREATE_BLOCK_INLINE_TOOLTIP_ID}`);

    if (isTooltipOpen && ["ArrowUp", "ArrowDown", "Enter", "Escape"].includes(e.code)) {
      return;
    }

    const isSlash = e.code === "Slash";

    if (isSlash) {
      if (acc.current.includes("Slash")) {
        acc.current = [];
        dispatch(uiStoreActions.removeTooltip(CREATE_BLOCK_INLINE_TOOLTIP_ID));
      } else {
        e.preventDefault();
        acc.current.push("Slash");
        dispatch(uiStoreActions.addTooltip({ tooltipId: CREATE_BLOCK_INLINE_TOOLTIP_ID }));
      }
    } else {
      acc.current = [];
      dispatch(uiStoreActions.removeTooltip(CREATE_BLOCK_INLINE_TOOLTIP_ID));
    }
  }

  function close() {
    dispatch(uiStoreActions.removeTooltip(CREATE_BLOCK_INLINE_TOOLTIP_ID));
    acc.current = [];
  }

  return [handle, close] as const;
}
