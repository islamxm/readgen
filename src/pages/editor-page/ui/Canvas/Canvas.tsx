import { useRef } from "react";
import { useDrag } from "@/hooks/useDrag";
import { useDocument, useDocumentShortcuts, useDocumentActions, useInlineCommands } from "@/hooks";
import { Block, LinkTooltip } from "@entities/block";
import { DocumentThumbnailObserver } from "../DocumentThumbnailObserver/DocumentThumbnailObserver";
import { EmptyDocumentBootstrap } from "../EmptyDocumentBootstrap/EmptyDocumentBootstrap";
import { CreateBlockTooltip } from "@features/create-block";
import { CreateEmojiTooltip } from "@/features/create-emoji";

export const Canvas = () => {
  const { rootOrder, id } = useDocument();
  const ref = useRef<HTMLDivElement>(null);
  const { addLink } = useDocumentActions();
  useDocumentShortcuts();
  useInlineCommands();
  const { containerRef } = useDrag();

  return (
    <>
      {/* тоже надо добавить к inlineTooltips */}
      <LinkTooltip addUrl={addLink} containerRef={ref as any} />

      <CreateBlockTooltip />
      <CreateEmojiTooltip />
      <div ref={ref} className="rounded-lg border h-full flex-1 p-2 pt-[20px] bg-white overflow-auto min-h-0 relative">
        {rootOrder.length === 0 && id && <EmptyDocumentBootstrap />}
        <div ref={containerRef} className="markdown-body pb-[50vh]">
          <DocumentThumbnailObserver containerRef={containerRef} />
          {rootOrder.map((nodeId) => (
            <Block nodeId={nodeId} key={nodeId} />
          ))}
        </div>
      </div>
    </>
  );
};
