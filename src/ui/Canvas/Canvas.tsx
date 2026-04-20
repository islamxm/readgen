import { useDocument, useDocumentShortcuts } from "../../hooks";
import { Block } from "../Block/Block";
import { LinkTooltip } from "../LinkTooltip/LinkTooltip";
import { useRef } from "react";
import { useDocumentActions } from "@/hooks/useDocumentActions";
import { useDrag_proto } from "@/hooks/useDrag";

export const Canvas = () => {
  const { rootOrder } = useDocument();
  const ref = useRef<HTMLDivElement>(null);
  const { addLink } = useDocumentActions();
  useDocumentShortcuts();
  const { containerRef } = useDrag_proto();

  return (
    <>
      <LinkTooltip addUrl={addLink} containerRef={ref as any} />
      <div
        ref={ref}
        className="rounded-lg border h-full flex-1 p-2 pt-[20px] bg-white overflow-auto min-h-0"
      >
        <div ref={containerRef} className="markdown-body pb-[50vh]">
          {rootOrder.map((nodeId) => (
            <Block nodeId={nodeId} key={nodeId} />
          ))}
        </div>
      </div>
    </>
  );
};
