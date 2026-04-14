import { useDocument, useNode } from "@/hooks";
import type { MOMBlockNodeType } from "@/mom/types";
import { getBlockColors } from "../tokens";
import { motion } from "motion/react";

//потом можно сделать так чтобы имел высоту в зависимости от контента чтобы визуально можно было понять размер блока
const Block = ({ nodeId }: { nodeId: string }) => {
  const node = useNode(nodeId);
  const { text, border } = getBlockColors(node.type as MOMBlockNodeType);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      layout
      className="h-[30px] w-full rounded-md p-2 flex justify-start items-center text-xs"
      style={{
        backgroundColor: border,
        border: `1px solid ${text}`,
        color: text,
      }}
    >
      {node.type}
    </motion.div>
  );
};

export const CanvasMap = () => {
  const { rootOrder } = useDocument();

  return (
    <motion.div
      layout
      className="flex flex-col gap-1 rounded-lg border h-full p-3 bg-white w-[250px] overflow-auto min-h-0"
    >
      {rootOrder.length > 0 ? (
        rootOrder.map((nodeId) => <Block key={nodeId} nodeId={nodeId} />)
      ) : (
        <>
          <motion.div
            initial={{ y: "20%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-center"
          >
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
