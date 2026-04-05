import classes from "./classes.module.scss";
import type { FC } from "react";
import { useNode } from "../../hooks";
import { renderer } from "../renderer";
import clsx from "clsx";
import { getBlockColors } from "../tokens";
import type { MOMBlockNodeType } from "../../mom/types";
import { motion } from "motion/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../shared";
import {
  BrushCleaning,
  Copy,
  CopyX,
  SquareMousePointer,
  SquareStack,
} from "lucide-react";
import { MOM } from "@/mom";
import { useUI } from "@/hooks";
import { useDocumentActions } from "@/hooks/useDocumentActions";
import { useNodeSelection } from "@/hooks/useNodeSelection";
import { useSelectionActions } from "@/hooks/useSelectionActions";
import { toast } from "sonner";

type Props = {
  nodeId: string;
};

/** Топ-левел нода, то что имеет свойства редактирования, этот компонент можно разделить на два, в первом - используем группировку и dnd, во втором - редактирование, так мы правильно декомпозируем и разделим ответственности */
export const Block: FC<Props> = ({ nodeId }) => {
  const node = useNode(nodeId);
  const { isSelected } = useNodeSelection(nodeId);
  const { selectNode, addToSelect, selectAllBlocks } = useSelectionActions();
  const { removeNode, copyNode } = useDocumentActions();
  const { blockHighlighting } = useUI();

  if (!node) return null;

  const { bg, border, text } = getBlockColors(node.type as MOMBlockNodeType);

  const select = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey) {
      addToSelect(nodeId);
    } else {
      selectNode(nodeId);
    }
  };

  const typeCssClass = MOM.Editor.getCssClassByNode(node);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          key={nodeId}
          layout={"position"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={clsx(typeCssClass, classes.wrapper)}
        >
          <div
            onClick={select}
            className={clsx(
              `rounded-sm border border-solid w-full outline-[4px]`,
              !blockHighlighting && classes.highlight_disabled,
            )}
            style={
              blockHighlighting
                ? {
                    backgroundColor: bg,
                    borderColor: text,
                    borderStyle: "solid",
                    outlineColor: isSelected ? border : "transparent",
                  }
                : { outline: `1px dashed ${text}`, border: "none" }
            }
          >
            {renderer(node)}
          </div>
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>
          <BrushCleaning /> Clear
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => {
            copyNode(node);
            toast.success("Block is copied");
          }}
        >
          <Copy /> Copy Block
        </ContextMenuItem>
        <ContextMenuItem>
          <SquareMousePointer onClick={() => selectNode(nodeId)} /> Select
        </ContextMenuItem>
        <ContextMenuItem onClick={selectAllBlocks}>
          <SquareStack /> Select all
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={() => removeNode(nodeId)}
          variant={"destructive"}
        >
          <CopyX /> Delete Block
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
