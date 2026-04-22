import { type FC } from "react";
import { AppWindowIcon, CodeIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@shared/ui";
import Textarea from "react-textarea-autosize";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import shadow from "react-shadow";

import gfmRawCssString from "@/styles/gfm-raw.scss?inline";
import gfmRawCssFixesString from "@/styles/gfm-raw-fixes.scss?inline";
import { useNode } from "@/hooks";
import { useRaw } from "../../lib/useRaw";
import type { MOMRaw } from "@/mom/types";
import { MOM } from "@/mom";

type Props = {
  nodeId: string;
};

export const RawNode: FC<Props> = ({ nodeId }) => {
  const node = useNode(nodeId);
  const { ref, fieldProps, tabProps } = useRaw(node as MOMRaw);

  const isValidNode = MOM.Guard.isRawNode(node);

  if (!isValidNode) return null;

  return (
    <div
      data-id={nodeId}
      data-type={node.type}
      data-parent-id={node.parentId ?? ""}
      className="block-node p-[5px]"
    >
      <div className="flex gap-2 justify-between mb-[5px]">
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
