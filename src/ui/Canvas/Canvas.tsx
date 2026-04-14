import { useDocument, useDocumentShortcuts } from "../../hooks";
import { Block } from "../Block/Block";
import { motion } from "motion/react";
import { LinkTooltip } from "../LinkTooltip/LinkTooltip";
import { useRef } from "react";
import { useDocumentActions } from "@/hooks/useDocumentActions";

export const Canvas = () => {
  const { rootOrder } = useDocument();
  const ref = useRef<HTMLDivElement>(null);
  const { addLink } = useDocumentActions();
  useDocumentShortcuts();

  return (
    <>
      <LinkTooltip addUrl={addLink} containerRef={ref as any} />
      <motion.div
        ref={ref}
        layout
        className="rounded-lg border h-full flex-1 p-2 bg-white overflow-auto min-h-0"
      >
        <div className="markdown-body pb-[50vh]">
          {rootOrder.map((nodeId) => (
            <Block nodeId={nodeId} key={nodeId} />
          ))}
        </div>
      </motion.div>
    </>
  );
};
