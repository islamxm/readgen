import { useFloating, offset, flip, shift } from "@floating-ui/react";
import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useCreateBlock } from "../../lib/useCreateBlock";
import { Button } from "@shared/ui";
import { useInlineTooltip } from "@/hooks";
import { CREATE_BLOCK_INLINE_TOOLTIP_ID } from "../../model/consts";
import { AlignLeft, Braces, Code2, Heading, Image, List, ListOrdered, Quote } from "lucide-react";
import { useCreateBlockTooltip } from "../../lib/useCreateBlockTooltip";
import { saveStateBeforeExternalUpdate } from "@/entities/block";
import { MOM } from "@/mom";

export const CreateBlockTooltip = () => {
  const { isOnlyActive } = useInlineTooltip(CREATE_BLOCK_INLINE_TOOLTIP_ID);
  const [_, close] = useCreateBlockTooltip();
  const { createHeading, createParagraph, createBlockquote, createList, createImage, createCode, createRaw } = useCreateBlock();
  const { refs, floatingStyles, update } = useFloating({
    placement: "bottom",
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });
  const [activeIndex, setActiveIndex] = useState(0);

  const actions = [
    { label: "Heading1", icon: <Heading />, action: createHeading },
    { label: "Paragraph", icon: <AlignLeft />, action: createParagraph },
    { label: "Quote", icon: <Quote />, action: createBlockquote },
    { label: "Ordered List", icon: <ListOrdered />, action: () => createList(true) },
    { label: "Unordered List", icon: <List />, action: createList },
    { label: "Image", icon: <Image />, action: createImage },
    { label: "Code", icon: <Code2 />, action: createCode },
    { label: "Raw", icon: <Braces />, action: createRaw },
  ];

  useEffect(() => {
    if (isOnlyActive) {
      const selection = window.getSelection();
      if (!selection) return;
      const range = selection.getRangeAt(0);

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
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((s) => (s + 1) % actions.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((s) => (s - 1 + actions.length) % actions.length);
          break;
        case "Enter": {
          e.stopImmediatePropagation();
          e.preventDefault();
          saveStateBeforeExternalUpdate(actions[activeIndex]?.action);
          setActiveIndex(0);
          close();
          break;
        }
        case "Esc":
          setActiveIndex(0);
          close();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [isOnlyActive, activeIndex, close]);

  const onSelect = (cb?: (...args: any[]) => void) => {
    saveStateBeforeExternalUpdate(cb);
    setActiveIndex(0);
    close();
  };

  return (
    <AnimatePresence>
      {isOnlyActive && (
        <motion.div
          id={CREATE_BLOCK_INLINE_TOOLTIP_ID}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          exit={{ opacity: 0 }}
          ref={refs?.setFloating}
          style={floatingStyles}
          className={"flex flex-col rounded-lg border bg-background shadow-md p-[3px] overflow-hidden z-50 gap-[5px]"}
        >
          {actions.map(({ label, icon, action }, index) => (
            <Button key={index} className="justify-start" onClick={() => onSelect(action)} variant={activeIndex === index ? "secondary" : "ghost"}>
              {icon} {label}
            </Button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
