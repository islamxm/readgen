import { getBlockColors } from "@/entities/block";
import { useDocumentActions, useSelectionActions } from "@/hooks";
import { MOM } from "@/mom";
import { Braces, Heading, TextAlignStart } from "lucide-react";
import { motion } from "motion/react";

export const EmptyDocumentBootstrap = () => {
  const headingColors = getBlockColors("heading");
  const paragraphColors = getBlockColors("paragraph");
  const rawColors = getBlockColors("raw");
  const { insertNode } = useDocumentActions();
  const { selectAndFocusNode } = useSelectionActions();

  const addHeading = () => {
    const node = MOM.Engine.createHeading(1);
    insertNode({
      node,
      parentId: null,
    });
    selectAndFocusNode(node.id);
  };

  const addParagraph = () => {
    const node = MOM.Engine.createParagraph();
    insertNode({
      node,
      parentId: null,
    });
    selectAndFocusNode(node.id);
  };

  const addRaw = () => {
    const node = MOM.Engine.createRaw();
    insertNode({
      node,
      parentId: null,
    });
    selectAndFocusNode(node.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex justify-center items-center gap-[15px] opacity-100 flex-col absolute inset-0"
    >
      <span className="text-md text-gray-300">Begin by adding your first block</span>
      <div className="flex flex-col gap-[5px] w-full items-center">
        <div
          className="w-[50%] border border-[2px] rounded-lg border-dashed cursor-pointer flex gap-[15px] p-[5px] opacity-70 hover:opacity-100 transition-opacity"
          style={{ backgroundColor: headingColors.bg, borderColor: headingColors.border }}
          onClick={addHeading}
        >
          <div
            className="w-[50px] h-[50px] rounded-md flex items-center justify-center"
            style={{ backgroundColor: headingColors.text, color: headingColors.bg }}
          >
            <Heading />
          </div>
          <div className="flex-col flex gap-[5px]">
            <span className="text-md" style={{ color: headingColors.text }}>
              Heading
            </span>
            <span className="text-[12px] opacity-50" style={{ color: headingColors.text }}>
              Set the main title
            </span>
          </div>
        </div>
        <div
          onClick={addParagraph}
          className="w-[50%] border border-[2px] rounded-lg border-dashed cursor-pointer flex gap-[15px] p-[5px] opacity-70 hover:opacity-100 transition-opacity"
          style={{ backgroundColor: paragraphColors.bg, borderColor: paragraphColors.border }}
        >
          <div
            className="w-[50px] h-[50px] rounded-md flex items-center justify-center"
            style={{ backgroundColor: paragraphColors.text, color: paragraphColors.bg }}
          >
            <TextAlignStart />
          </div>
          <div className="flex-col flex gap-[5px]">
            <span className="text-md" style={{ color: paragraphColors.text }}>
              Paragraph
            </span>
            <span className="text-[12px] opacity-50" style={{ color: paragraphColors.text }}>
              Set the main title
            </span>
          </div>
        </div>
        <div
          onClick={addRaw}
          className="w-[50%] border border-[2px] rounded-lg border-dashed cursor-pointer flex gap-[15px] p-[5px] opacity-70 hover:opacity-100 transition-opacity"
          style={{ backgroundColor: rawColors.bg, borderColor: rawColors.border }}
        >
          <div
            className="w-[50px] h-[50px] rounded-md flex items-center justify-center"
            style={{ backgroundColor: rawColors.text, color: rawColors.bg }}
          >
            <Braces />
          </div>
          <div className="flex-col flex gap-[5px]">
            <span className="text-md" style={{ color: rawColors.text }}>
              Raw
            </span>
            <span className="text-[12px] opacity-50" style={{ color: rawColors.text }}>
              Custom HTML/Markdown
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
