import {
  useEffect,
  useState,
  type FC,
  type RefObject,
} from "react";
import { Bold, Italic, Link, Strikethrough } from "lucide-react";
import { Button } from "@shared/ui";
import type { MOMTextMarks } from "@/mom/types";
import { useFloating, offset, flip, shift, inline } from "@floating-ui/react";
import { MOM } from "@/mom";
import { AnimatePresence, motion } from "motion/react";

type Props = {
  containerRef: RefObject<HTMLElement>;
  applyFormat: (format: keyof MOMTextMarks) => void;
  save?: any;
};

/** сейчас этот контейнер для каждого блока свой, надо вынести на уровень Canvas */
export const FormatToolbar: FC<Props> = ({
  containerRef,
  applyFormat,
  // save,
}) => {
  const [visible, setVisible] = useState(false);
  const { refs, floatingStyles, update } = useFloating({
    placement: "top",
    middleware: [inline(), offset(8), flip(), shift({ padding: 8 })],
  });

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || MOM.Editor.isNothingSelected(selection)) {
        setVisible(false);
        return;
      }

      if (!containerRef.current?.contains(selection.anchorNode)) {
        setVisible(false);
        return;
      }

      const range = selection.getRangeAt(0);

      refs.setReference({
        getBoundingClientRect: () => range.getBoundingClientRect(),
        getClientRects: () => range.getClientRects(),
      });

      setVisible(true);
      update();
    };

    const handleScroll = () => setVisible(false);

    const handleMouseDown = (e: MouseEvent) => {
      if (refs.floating.current?.contains(e.target as Node)) return;
      setVisible(false);
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("selectionchange", handleSelectionChange);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("selectionchange", handleSelectionChange);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [containerRef]);

  const onApply = (e: React.MouseEvent, format: keyof MOMTextMarks) => {
    e.preventDefault();
    applyFormat(format);
    setVisible(false);
  };


  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          exit={{ opacity: 0 }}
          ref={refs?.setFloating}
          style={floatingStyles}
          className={
            "flex items-center rounded-lg border bg-background shadow-md p-[3px] overflow-hidden"
          }
          onMouseDown={(e) => e.preventDefault()}
        >
          <Button
            size={"icon"}
            variant={"ghost"}
            onMouseDown={(e) => onApply(e, "bold")}
          >
            <Bold />
          </Button>
          <Button
            size={"icon"}
            variant={"ghost"}
            onMouseDown={(e) => onApply(e, "italic")}
          >
            <Italic />
          </Button>
          <Button
            size={"icon"}
            variant={"ghost"}
            onMouseDown={(e) => onApply(e, "lineThrough")}
          >
            <Strikethrough />
          </Button>
          <Button
            size={"icon"}
            variant={"outline"}
            onMouseDown={(e) => onApply(e, "link")}
          >
            <Link />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
