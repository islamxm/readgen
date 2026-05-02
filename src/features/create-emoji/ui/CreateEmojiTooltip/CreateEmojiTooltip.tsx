import { useInlineTooltip } from "@/hooks";
import { CREATE_EMOJI_INLINE_TOOLTIP_ID } from "../../model/consts";
import { useCreateEmojiTooltip } from "../../lib/useCreateEmojiTooltip";
import { flip, offset, shift, useFloating } from "@floating-ui/react";
import { useEffect } from "react";
import { MOM } from "@/mom";
import { AnimatePresence, motion } from "motion/react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";

export const CreateEmojiTooltip = () => {
  const { isOnlyActive } = useInlineTooltip(CREATE_EMOJI_INLINE_TOOLTIP_ID);
  const [_, close] = useCreateEmojiTooltip();
  const { refs, floatingStyles, update } = useFloating({
    placement: "bottom",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  useEffect(() => {
    if (isOnlyActive) {
      const selection = window.getSelection();
      if (!selection) return;
      const range = MOM.Editor.getRange(selection);

      refs.setReference({
        getBoundingClientRect: () => {
          const rect = range.getBoundingClientRect();
          if (rect.width === 0 && rect.height === 0) {
            return MOM.Editor.getEmptyCaretRect(range);
          }
          return rect;
        },
      });
      update();
    }
  }, [isOnlyActive, update, refs]);

  useEffect(() => {
    if (!isOnlyActive) return;
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "Escape":
          close();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [isOnlyActive, close]);

  const insert = (e: EmojiClickData) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = MOM.Editor.getRange(selection);
    range.deleteContents();

    const textNode = document.createTextNode(e.emoji);
    range.insertNode(textNode);

    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);

    close();
  };

  return (
    <AnimatePresence>
      {isOnlyActive && (
        <motion.div
          onMouseDown={(e) => e.preventDefault()}
          id={CREATE_EMOJI_INLINE_TOOLTIP_ID}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          exit={{ opacity: 0 }}
          ref={refs?.setFloating}
          style={floatingStyles}
          className={"flex flex-col rounded-lg border bg-background shadow-md p-[3px] overflow-hidden z-50 gap-[5px]"}
        >
          <EmojiPicker open={isOnlyActive} previewConfig={{ showPreview: false }} searchDisabled skinTonesDisabled onEmojiClick={insert} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
