import type { FC, ReactNode } from "react";
import { useEditor, useNode } from "../../hooks";
import { MOM } from "../../mom";
import { FormatToolbar } from "../FormatToolbar/FormatToolbar";
import type { MOMAlert } from "@/mom/types";
import clsx from "clsx";
import {
  Info,
  Lightbulb,
  MessageSquareWarning,
  OctagonAlert,
  TriangleAlert,
} from "lucide-react";

const alertVariantOptions: Record<
  MOMAlert["variant"],
  { classes: string; title: ReactNode }
> = {
  note: {
    classes: "markdown-alert-note",
    title: (
      <>
        <Info size={16} className="markdown-alert-icon" /> Note
      </>
    ),
  },
  tip: {
    classes: "markdown-alert-tip",
    title: (
      <>
        <Lightbulb size={16} className="markdown-alert-icon" /> Tip
      </>
    ),
  },
  important: {
    classes: "markdown-alert-important",
    title: (
      <>
        <MessageSquareWarning size={16} className="markdown-alert-icon" />{" "}
        Important
      </>
    ),
  },
  warning: {
    classes: "markdown-alert-warning",
    title: (
      <>
        <TriangleAlert size={16} className="markdown-alert-icon" /> Warning
      </>
    ),
  },
  caution: {
    classes: "markdown-alert-caution",
    title: (
      <>
        <OctagonAlert size={16} className="markdown-alert-icon" /> Caution
      </>
    ),
  },
};

type Props = {
  nodeId: string;
};

export const AlertNode: FC<Props> = ({ nodeId }) => {
  const node = useNode(nodeId);
  const { editorProps, ref, applyFormat } = useEditor<HTMLDivElement>(node);
  const isValidNode = MOM.Guard.isAlertNode(node);

  if (!isValidNode) return null;

  const { classes, title } = alertVariantOptions[node.variant];

  return (
    <>
      <FormatToolbar containerRef={ref as any} applyFormat={applyFormat} />
      <span className={clsx("markdown-alert block", classes)}>
        <span className="markdown-alert-title">{title}</span>
        <p
          ref={ref}
          {...editorProps}
          data-id={nodeId}
          data-type={node.type}
          data-parent-id={node.parentId ?? ""}
        />
      </span>
    </>
  );
};
