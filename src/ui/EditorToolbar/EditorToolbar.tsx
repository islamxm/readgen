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
import { useDocument, useSelection } from "@/hooks";
import { MOM } from "@/mom";
import type { MOMHeading } from "@/mom/types";
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
} from "lucide-react";

export const EditorToolbar = () => {
  const { insertNode, rootOrder, insertNodes } = useDocument();
  const { focusNewNode } = useSelection();

  const addParagraph = () => {
    const node = MOM.Engine.createParagraph();
    insertNode({
      node,
      parentId: null,
      index: rootOrder.length,
    });
    focusNewNode(node.id);
  };

  const addHeading = (depth: MOMHeading["depth"]) => {
    const node = MOM.Engine.createHeading(depth);
    insertNode({
      node,
      parentId: null,
      index: rootOrder.length,
    });
    // выпадающее меню кнопки хединга как то мешает навести фокус
    focusNewNode(node.id);
  };

  const addBlockquote = () => {
    const node = MOM.Engine.createBlockquote();
    insertNode({
      node,
      parentId: null,
      index: rootOrder.length,
    });
    focusNewNode(node.id);
  };

  // делаем это, тут не сложно должно быть на самом деле
  const addCode = () => {
    insertNode({
      node: MOM.Engine.createCode(),
      parentId: null,
      index: rootOrder.length,
    });
  };

  const addList = (isOrdered?: boolean) => {
    const listNode = MOM.Engine.createList(isOrdered);
    const listItemNode = MOM.Engine.createListItem(listNode.id);

    insertNodes([
      { node: listNode, parentId: null, index: rootOrder.length },
      { node: listItemNode, parentId: listNode.id, index: 0 },
    ]);
  };

  const addImage = () => {
    insertNode({
      node: MOM.Engine.createImage(),
      parentId: null,
      index: rootOrder.length,
    });
  };

  const addBreak = () => {
    insertNode({
      node: MOM.Engine.createThematicBreak(),
      parentId: null,
      index: rootOrder.length,
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
        <TooltipContent side={"right"}>Create paragraph block</TooltipContent>
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
        <TooltipContent side={"right"}>Create blockquote</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <Button variant={"secondary"} size={"icon"} onClick={addCode}>
            <Code2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create code block</TooltipContent>
      </Tooltip>
      {/* <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant={"secondary"} size={"icon"}>
            <List />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side={"right"}>
          <DropdownMenuItem onClick={() => addList()}>
            <List /> Unordered list
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => addList(true)}>
            <ListOrdered /> Ordered list
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu> */}

      {/* <Tooltip>
        <TooltipTrigger>
          <Button variant={"secondary"} size={"icon"} onClick={addImage}>
            <Image />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create image block</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <Button variant={"secondary"} size={"icon"} onClick={addBreak}>
            <SeparatorHorizontal />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create thematic break</TooltipContent>
      </Tooltip>
       */}
    </div>
  );
};
