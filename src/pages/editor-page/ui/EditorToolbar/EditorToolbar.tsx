import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@shared/ui";
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
  TextAlignStart,
} from "lucide-react";
import { CompositionMenuButton } from "@/features/create-composition";
import { useCreateBlock } from "@/features/create-block";

export const EditorToolbar = () => {
  const { createHeading, createParagraph, createBlockquote, createAlert, createList, createBreak, createImage, createCode, createRaw } =
    useCreateBlock();

  return (
    <div className={"p-2 gap-2 flex flex-col border-r min-h-0 overflow-auto bg-white rounded-lg hide-scrollbar"}>
      <CompositionMenuButton />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"outline"} size={"icon"} onClick={() => createHeading(1)}>
            <Heading1 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Heading 1</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"outline"} size={"icon"} onClick={() => createHeading(2)}>
            <Heading2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Heading 2</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"outline"} size={"icon"} onClick={() => createHeading(3)}>
            <Heading3 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Heading 3</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"outline"} size={"icon"} onClick={() => createHeading(4)}>
            <Heading4 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Heading 4</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"outline"} size={"icon"} onClick={() => createHeading(5)}>
            <Heading5 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Heading 5</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"outline"} size={"icon"} onClick={() => createHeading(6)}>
            <Heading6 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Heading 6</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"outline"} size={"icon"} onClick={createParagraph}>
            <TextAlignStart />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Paragraph</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"outline"} size={"icon"} onClick={createBlockquote}>
            <Quote />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Quote</TooltipContent>
      </Tooltip>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"} size={"icon"}>
                <AlertCircle />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side={"right"}>Create Alert</TooltipContent>
          <DropdownMenuContent side={"right"}>
            <DropdownMenuItem onClick={() => createAlert("note")}>
              <Info color="#0969da" /> Note
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => createAlert("tip")}>
              <Lightbulb color="#1a7f37" /> Tip
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => createAlert("important")}>
              <MessageSquareWarning color="#8250df" /> Important
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => createAlert("warning")}>
              <TriangleAlert color="#9a6700" /> Warning
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => createAlert("caution")}>
              <OctagonAlert color="#cf222e" /> Caution
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"outline"} size={"icon"} onClick={() => createList(true)}>
            <ListOrdered />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Ordered List</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"outline"} size={"icon"} onClick={() => createList()}>
            <List />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Unordered List</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"outline"} size={"icon"} onClick={createBreak}>
            <SeparatorHorizontal />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Thematic Break</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"outline"} size={"icon"} onClick={createImage}>
            <Image />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Image block</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"outline"} size={"icon"} onClick={createCode}>
            <Code2 />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Code</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={"outline"} size={"icon"} onClick={createRaw}>
            <Braces />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Create Raw block</TooltipContent>
      </Tooltip>
    </div>
  );
};
