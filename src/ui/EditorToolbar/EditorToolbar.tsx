import { useDocumentActions } from "@/hooks/useDocumentActions";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../shared";
import { MOM } from "@/mom";
import type { MOMAlert, MOMHeading } from "@/mom/types";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  Quote,
  Image,
  SeparatorHorizontal,
  Code2,
  ListOrdered,
  AlertCircle,
  Lightbulb,
  Info,
  MessageSquareWarning,
  TriangleAlert,
  OctagonAlert,
  Braces,
  Puzzle,
} from "lucide-react";
import { useSelectionActions } from "@/hooks/useSelectionActions";
import { useCompositions } from "@/hooks";

export const EditorToolbar = () => {
  const { insertNode, insertNodes } = useDocumentActions();
  const { selectAndFocusNode } = useSelectionActions();
  const {
    createProjectHeroComposition,
    createQuickInstallComposition,
    createFeatureShowcaseComposition,
    createUsageSnippetComposition,
  } = useCompositions();

  const addParagraph = () => {
    const node = MOM.Engine.createParagraph();
    insertNode({
      node,
      parentId: null,
    });
    selectAndFocusNode(node.id);
  };

  const addHeading = (depth: MOMHeading["depth"]) => {
    const node = MOM.Engine.createHeading(depth);
    insertNode({
      node,
      parentId: null,
    });
    selectAndFocusNode(node.id);
  };

  const addBlockquote = () => {
    const node = MOM.Engine.createBlockquote();
    insertNode({
      node,
      parentId: null,
    });
    selectAndFocusNode(node.id);
  };

  const addAlert = (variant?: MOMAlert["variant"]) => {
    const node = MOM.Engine.createAlert(null, variant);
    insertNode({
      node,
      parentId: null,
    });
    selectAndFocusNode(node.id);
  };

  const addCode = () => {
    const node = MOM.Engine.createCode();
    insertNode({
      node,
      parentId: null,
    });
    selectAndFocusNode(node.id);
  };

  const addList = (isOrdered?: boolean) => {
    const listNode = MOM.Engine.createList(isOrdered);
    const listItemNode = MOM.Engine.createListItem(listNode.id);

    insertNodes([
      { node: listNode, parentId: null },
      { node: listItemNode, parentId: listNode.id, index: 0 },
    ]);
    selectAndFocusNode(listNode.id);
  };

  const addImage = () => {
    const node = MOM.Engine.createImage();
    insertNode({
      node,
      parentId: null,
    });
    selectAndFocusNode(node.id);
  };

  const addBreak = () => {
    const node = MOM.Engine.createThematicBreak();
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
    <div className={"p-2 gap-2 flex flex-col border-r min-h-0 overflow-auto"}>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button size={"icon"}>
                <Puzzle />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side={"right"}>Compositions</TooltipContent>
          <DropdownMenuContent side={"right"}>
            <DropdownMenuItem onClick={createProjectHeroComposition}>
              Project Hero
            </DropdownMenuItem>
            <DropdownMenuItem onClick={createQuickInstallComposition}>
              Quick Install
            </DropdownMenuItem>
            <DropdownMenuItem onClick={createFeatureShowcaseComposition}>
              Feature Showcase
            </DropdownMenuItem>
            <DropdownMenuItem onClick={createUsageSnippetComposition}>
              Usage Snippet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"secondary"}
            size={"icon"}
            onClick={() => addHeading(1)}
          >
            <Heading1 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Heading 1</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"secondary"}
            size={"icon"}
            onClick={() => addHeading(2)}
          >
            <Heading2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Heading 2</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"secondary"}
            size={"icon"}
            onClick={() => addHeading(3)}
          >
            <Heading3 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Heading 3</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"secondary"}
            size={"icon"}
            onClick={() => addHeading(4)}
          >
            <Heading4 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Heading 4</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"secondary"}
            size={"icon"}
            onClick={() => addHeading(5)}
          >
            <Heading5 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Heading 5</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"secondary"}
            size={"icon"}
            onClick={() => addHeading(6)}
          >
            <Heading6 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Heading 6</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"secondary"} size={"icon"} onClick={addParagraph}>
            P
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Paragraph</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"secondary"} size={"icon"} onClick={addBlockquote}>
            <Quote />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Quote</TooltipContent>
      </Tooltip>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant={"secondary"} size={"icon"}>
                <AlertCircle />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side={"right"}>Create Alert</TooltipContent>
          <DropdownMenuContent side={"right"}>
            <DropdownMenuItem onClick={() => addAlert("note")}>
              <Info color="#0969da" /> Note
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addAlert("tip")}>
              <Lightbulb color="#1a7f37" /> Tip
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addAlert("important")}>
              <MessageSquareWarning color="#8250df" /> Important
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addAlert("warning")}>
              <TriangleAlert color="#9a6700" /> Warning
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addAlert("caution")}>
              <OctagonAlert color="#cf222e" /> Caution
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"secondary"} size={"icon"} onClick={addCode}>
            <Code2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Code</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"secondary"}
            size={"icon"}
            onClick={() => addList(true)}
          >
            <ListOrdered />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Ordered List</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"secondary"} size={"icon"} onClick={() => addList()}>
            <List />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Unordered List</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"secondary"} size={"icon"} onClick={addBreak}>
            <SeparatorHorizontal />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Thematic Break</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"secondary"} size={"icon"} onClick={addImage}>
            <Image />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Image block</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"secondary"} size={"icon"} onClick={addRaw}>
            <Braces />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Raw block</TooltipContent>
      </Tooltip>
    </div>
  );
};
