import { useDocument } from "../../hooks";
import { Block } from "../Block/Block";
import { motion } from "motion/react";
import { LinkTooltip } from "../LinkTooltip/LinkTooltip";
import { useRef } from "react";
import { useDocumentActions } from "@/hooks/useDocumentActions";

export const Canvas = () => {
  const { rootOrder } = useDocument();
  const ref = useRef<HTMLDivElement>(null);
  const { addLink } = useDocumentActions();

  return (
    <>
      <LinkTooltip addUrl={addLink} containerRef={ref as any} />
      <motion.div
        ref={ref}
        layout
        className="markdown-body rounded-lg border h-full flex-1 p-2"
      >
        {rootOrder.map((nodeId) => (
          <Block nodeId={nodeId} key={nodeId} />
        ))}
      </motion.div>
    </>
  );
};
