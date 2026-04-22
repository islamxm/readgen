import { useDocument, useNode } from "@/hooks";
import type { MOMAllContent, MOMBlockNodeType } from "@/mom/types";
import { motion } from "motion/react";
import { useSelectionActions } from "@/hooks";
import clsx from "clsx";
import { useRef } from "react";
import { getBlockColors } from "@entities/block";

const getValueForBlockVisualHeight = (node: MOMAllContent) => {
  const id = node.id;
  if ("value" in node) {
    return node.value.length;
  }
  const element = document.querySelector(`[data-id="${id}"]`);
  if (!element) return 0;
  return element.textContent.length;
};

//потом можно сделать так чтобы имел высоту в зависимости от контента чтобы визуально можно было понять размер блока
const Block = ({ nodeId }: { nodeId: string }) => {
  const node = useNode(nodeId);
  const { selectNode } = useSelectionActions();
  const { text, border, bg } = getBlockColors(node.type as MOMBlockNodeType);
  const ref = useRef<HTMLDivElement>(null);

  const height = 30 + getValueForBlockVisualHeight(node) * 0.2;

  const scrollToElement = () => {
    if (!ref.current) return;
    const element = document.querySelector(`[data-id="${nodeId}"]`);
    selectNode(nodeId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
      ref.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
      className={clsx("w-full rounded-md p-2 flex justify-start items-center text-xs cursor-pointer flex-none")}
      style={{
        backgroundColor: border,
        color: text,
        height,
      }}
      whileHover={{
        backgroundColor: text,
        color: bg,
      }}
      onClick={scrollToElement}
    >
      {node.type}
    </motion.div>
  );
};

export const CanvasMap = () => {
  const { rootOrder } = useDocument();

  return (
    <motion.div layout className="flex flex-col gap-1 rounded-lg border h-full p-3 bg-white w-[250px] overflow-auto min-h-0">
      {rootOrder.length > 0 ? (
        rootOrder.map((nodeId) => <Block key={nodeId} nodeId={nodeId} />)
      ) : (
        <>
          <motion.div initial={{ y: "20%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-lg text-center">
            Structure
          </motion.div>
          <motion.div
            initial={{ y: "20%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-center text-muted-foreground"
          >
            A tile-based outline of your document will be displayed here.
          </motion.div>
        </>
      )}
    </motion.div>
  );
};
