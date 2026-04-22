import { useEffect, useRef, type FC, type RefObject } from "react";
import { useFloating, flip, shift } from "@floating-ui/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button, InputGroup, InputGroupInput } from "@shared/ui";

type Props = {
  containerRef: RefObject<HTMLElement>;
  addUrl?: (url: string, linkId: string) => void;
};

export const LinkTooltip: FC<Props> = ({ containerRef, addUrl }) => {
  const [state, setState] = useState<{ url: string } | null>(null);
  const { refs, floatingStyles } = useFloating({
    placement: "top",
    middleware: [flip(), shift({ padding: 8 })],
  });
  const spanRef = useRef<HTMLElement>(null);
  //для решения проблемы stale closure в addEventListener()
  const stateRef = useRef<{ url: string } | null>(state);

  // тут работаем только с рефами опять так и из за проблемы stale closure
  const onSave = () => {
    if (!spanRef.current || !stateRef.current) return;
    const id = spanRef.current.dataset.id as string;
    addUrl?.(stateRef.current.url || "", id);
  };

  const close = () => {
    setState(null);
    stateRef.current = null;
    spanRef.current = null;
  };

  // основная логика тоггла тултипа
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const span = target.closest<HTMLElement>("[data-link='true']");

      if (!span) return;
      spanRef.current = span;

      refs.setReference({
        getBoundingClientRect: () => span.getBoundingClientRect(),
        getClientRects: () => span.getClientRects(),
      });
      setState({ url: span.dataset.url ?? "" });
    };

    const handleMouseOut = (e: MouseEvent) => {
      const to = e.relatedTarget as Node | null;
      if (refs.floating.current?.contains(to)) return;
      onSave();
      close();
    };

    container.addEventListener("mouseover", handleMouseOver);
    container.addEventListener("mouseout", handleMouseOut);

    return () => {
      container.removeEventListener("mouseover", handleMouseOver);
      container.removeEventListener("mouseout", handleMouseOut);
    };
  }, [containerRef]);

  // закрытие при outside action
  useEffect(() => {
    if (!state) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (refs.floating.current?.contains(target)) return;
      close();
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [state]);

  const goToLink = () => {
    if (!spanRef.current) return;
    const url = spanRef.current.dataset.url;
    if (!url) return;
    window.open(url);
  };

  const onKeyDownEnter = (e: React.KeyboardEvent) => {
    if (e.code === "Enter") {
      e.stopPropagation();
      e.preventDefault();
      onSave();
      close();
    }
  };

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          ref={refs?.setFloating}
          style={floatingStyles}
          className="flex bg-background rounded-md shadow border"
        >
          <InputGroup className="border-none shadow-none rounded-r-none">
            <InputGroupInput
              onKeyDown={onKeyDownEnter}
              value={state.url}
              onChange={(e) => {
                setState({ url: e.target.value });
                stateRef.current = { url: e.target.value };
              }}
              placeholder="https://..."
            />
          </InputGroup>
          <Button
            className="rounded-l-none"
            onClick={goToLink}
            variant={"secondary"}
            size={"icon"}
          >
            <ExternalLink />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
