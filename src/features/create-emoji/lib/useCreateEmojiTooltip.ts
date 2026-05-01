import { useDispatch } from "@shared/lib";
import { useRef } from "react";
import { CREATE_EMOJI_INLINE_TOOLTIP_ID } from "../model/consts";
import { uiStoreActions } from "@/store/slices/uiSlice";

export function useCreateEmojiTooltip() {
  const dispatch = useDispatch();
  const acc = useRef<Array<string>>([]);

  function handle(e: KeyboardEvent) {
    const inEditableBlock = e.target instanceof Element && e.target.closest("[data-editable]");

    if (!inEditableBlock) return;

    const isTooltipOpen = !!document.querySelector(`#${CREATE_EMOJI_INLINE_TOOLTIP_ID}`);

    if (isTooltipOpen && ["Escape"].includes(e.code)) {
      return;
    }

    const isColon = e.key === ":";

    if (isColon) {
      if (acc.current.includes(":")) {
        acc.current = [];
        dispatch(uiStoreActions.removeTooltip(CREATE_EMOJI_INLINE_TOOLTIP_ID));
      } else {
        e.preventDefault();
        acc.current.push(":");
        dispatch(uiStoreActions.addTooltip({ tooltipId: CREATE_EMOJI_INLINE_TOOLTIP_ID }));
      }
    } else {
      acc.current = [];
      dispatch(uiStoreActions.removeTooltip(CREATE_EMOJI_INLINE_TOOLTIP_ID));
    }
  }

  function close() {
    dispatch(uiStoreActions.removeTooltip(CREATE_EMOJI_INLINE_TOOLTIP_ID));
    acc.current = [];
  }

  return [handle, close] as const;
}
