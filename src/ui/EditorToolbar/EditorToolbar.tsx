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
  Heading,
  ListOrdered,
  AlertCircle,
  MessageCircleWarning,
  Lightbulb,
  Info,
  MessageSquareWarning,
  TriangleAlert,
  OctagonAlert,
  Table,
} from "lucide-react";
import { useSelectionActions } from "@/hooks/useSelectionActions";

export const EditorToolbar = () => {
  const { insertNode, insertNodes } = useDocumentActions();
  const { focusNewNode } = useSelectionActions();

  const addParagraph = () => {
    const node = MOM.Engine.createParagraph();
    insertNode({
      node,
      parentId: null,
    });
    focusNewNode(node.id);
  };

  const addHeading = (depth: MOMHeading["depth"]) => {
    const node = MOM.Engine.createHeading(depth);
    insertNode({
      node,
      parentId: null,
    });
    // выпадающее меню кнопки хединга как то мешает навести фокус
    focusNewNode(node.id);
  };

  const addBlockquote = () => {
    const node = MOM.Engine.createBlockquote();
    insertNode({
      node,
      parentId: null,
    });
    focusNewNode(node.id);
  };

  const addAlert = (variant?: MOMAlert["variant"]) => {
    const node = MOM.Engine.createAlert(null, variant);
    insertNode({
      node,
      parentId: null,
    });
    focusNewNode(node.id);
  };

  const addCode = () => {
    insertNode({
      node: MOM.Engine.createCode(),
      parentId: null,
    });
  };

  const addList = (isOrdered?: boolean) => {
    const listNode = MOM.Engine.createList(isOrdered);
    const listItemNode = MOM.Engine.createListItem(listNode.id);

    insertNodes([
      { node: listNode, parentId: null },
      { node: listItemNode, parentId: listNode.id, index: 0 },
    ]);
  };

  const addImage = () => {
    insertNode({
      node: MOM.Engine.createImage(),
      parentId: null,
    });
  };

  const addBreak = () => {
    insertNode({
      node: MOM.Engine.createThematicBreak(),
      parentId: null,
    });
  };

  return (
    <div className={"p-2 gap-2 flex flex-col border-r"}>
      <Tooltip>
        <TooltipTrigger>
          <Button variant={"secondary"} size={"icon"} onClick={addParagraph}>
            P
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Paragraph</TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant={"secondary"} size={"icon"}>
            <Heading />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side={"right"}>
          <DropdownMenuItem onClick={() => addHeading(1)}>
            <Heading1 /> Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addHeading(2)}>
            <Heading2 /> Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addHeading(3)}>
            <Heading3 /> Heading 3
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addHeading(4)}>
            <Heading4 /> Heading 4
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addHeading(5)}>
            <Heading5 /> Heading 5
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addHeading(6)}>
            <Heading6 /> Heading 6
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Tooltip>
        <TooltipTrigger>
          <Button variant={"secondary"} size={"icon"} onClick={addBlockquote}>
            <Quote />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Quote</TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Tooltip>
            <TooltipTrigger>
              <Button variant={"secondary"} size={"icon"}>
                <AlertCircle />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={"right"}>Create Alert</TooltipContent>
          </Tooltip>
        </DropdownMenuTrigger>
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
      <Tooltip>
        <TooltipTrigger>
          <Button variant={"secondary"} size={"icon"} onClick={addCode}>
            <Code2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Code</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
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
        <TooltipTrigger>
          <Button variant={"secondary"} size={"icon"} onClick={() => addList()}>
            <List />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Unordered List</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <Button disabled variant={"secondary"} size={"icon"}>
            <Table />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Coming Soon (Table)</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <Button variant={"secondary"} size={"icon"} onClick={addBreak}>
            <SeparatorHorizontal />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Thematic Break</TooltipContent>
      </Tooltip>
      {/* <Tooltip>
        <TooltipTrigger>
          <Button variant={"secondary"} size={"icon"} onClick={addImage}>
            <Image />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create image block</TooltipContent>
      </Tooltip>
      
       */}
    </div>
  );
};
