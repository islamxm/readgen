import { useState, type ChangeEvent, type FC } from "react";
import { useHtml, useNode } from "../../hooks";
import { MOM } from "../../mom";
import type { MOMHtml } from "../../mom/types";
import { AppWindowIcon, CodeIcon } from "lucide-react";
import { useDocumentActions } from "@/hooks/useDocumentActions";
import { useSelectionActions } from "@/hooks/useSelectionActions";
import { Tabs, TabsList, TabsTrigger } from "../shared";
import Textarea from "react-textarea-autosize";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import shadow from "react-shadow";

import gfmRawCssString from "@/styles/gfm-raw.scss?inline";
import gfmRawCssFixesString from "@/styles/gfm-raw-fixes.scss?inline";

type Props = {
  nodeId: string;
};

export const HtmlNode: FC<Props> = ({ nodeId }) => {
  const node = useNode(nodeId);
  const { ref, fieldProps, tabProps } = useHtml(node as MOMHtml);

  const isValidNode = MOM.Guard.isHtmlNode(node);

  if (!isValidNode) return null;

  return (
    <div
      data-id={nodeId}
      data-type={node.type}
      data-parent-id={node.parentId ?? ""}
      className="block-node p-[5px]"
    >
      <div className="flex gap-2 justify-between">
        <Tabs {...tabProps}>
          <TabsList className={`bg-[#B8E6EC] rounded-sm`}>
            <TabsTrigger
              className="w-full max-w-48 shadow-none border-none rounded-sm"
              value="raw"
            >
              <CodeIcon />
              Raw
            </TabsTrigger>
            <TabsTrigger
              className="w-full max-w-48 shadow-none border-none rounded-sm"
              value="preview"
            >
              <AppWindowIcon />
              Preview
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {tabProps.value === "preview" && (
        <shadow.div>
          <style>{gfmRawCssString}</style>
          <style>{gfmRawCssFixesString}</style>
          <div className="markdown-raw">
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {node.value}
            </Markdown>
          </div>
        </shadow.div>
      )}
      {tabProps.value === "raw" && (
        <div className="bg-transparent">
          <Textarea
            ref={ref}
            {...fieldProps}
            className="p-[10px] resize-none outline-none border-none w-full"
          />
        </div>
      )}
    </div>
  );
};
