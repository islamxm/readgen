import {
  BookA,
  BookMarked,
  BrushCleaning,
  Download,
  File,
  FileJson,
  FilePlus,
  Grid2X2Plus,
  Group,
  HelpCircle,
  Keyboard,
  LayoutTemplate,
  Redo2,
  Save,
  Settings,
  SquareStack,
  Trash2,
  Undo2,
  Ungroup,
} from "lucide-react";
import {
  Button,
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../shared";
import logo from "../../../public/logo.svg";
import { useDocumentActions, useHistory } from "@/hooks";
import { useUI } from "@/hooks";

export const TopToolbar = () => {
  const { undo, redo } = useHistory();
  const { toggleBlockHighlighting, blockHighlighting } = useUI();
  const { clearDocument } = useDocumentActions();

  return (
    <div className="border-bottom border-b flex gap-2">
      <a
        href="#"
        className="w-[53px] hatching border-r logo flex justify-center items-center"
      >
        <img src={logo} width={40} height={40} alt="Readgen" className="flex" />
      </a>
      <div className="flex p-2 gap-1 justify-between flex-1">
        <div className="flex gap-1">
          <div className="flex gap-1">
            <Button>
              <FilePlus />
              New File
            </Button>
            <Button onClick={undo} variant={"secondary"} size={"icon"}>
              <Undo2 />
            </Button>
            <Button onClick={redo} variant={"secondary"} size={"icon"}>
              <Redo2 />
            </Button>
          </div>
          <div>
            <Menubar>
              <MenubarMenu>
                <MenubarTrigger>File</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    <FilePlus /> New
                  </MenubarItem>
                  <MenubarItem disabled>
                    <Save /> Save
                  </MenubarItem>
                  <MenubarItem disabled>
                    <LayoutTemplate /> Save as template
                  </MenubarItem>
                  <MenubarItem disabled>
                    <Settings /> Settings
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={clearDocument} variant={"destructive"}>
                    <BrushCleaning /> Clear
                  </MenubarItem>
                  <MenubarItem onClick={clearDocument} variant={"destructive"}>
                    <Trash2 /> Delete
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Edit</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem onClick={undo}>
                    <Undo2 /> Undo
                  </MenubarItem>
                  <MenubarItem onClick={redo}>
                    <Redo2 /> Redo
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem onClick={toggleBlockHighlighting}>
                    <SquareStack /> {blockHighlighting ? "Disable" : "Enable"}{" "}
                    block highlighting
                  </MenubarItem>
                  <MenubarSeparator />
                  <MenubarItem disabled>
                    <BrushCleaning /> Clear all
                  </MenubarItem>
                  <MenubarItem disabled>
                    <Group /> Group all
                  </MenubarItem>
                  <MenubarItem disabled>
                    <Ungroup /> Ungroup all
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Export</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem disabled>
                    <FileJson /> JSON
                  </MenubarItem>
                  <MenubarItem disabled>
                    <File /> Markdown
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
              <MenubarMenu>
                <MenubarTrigger>Help</MenubarTrigger>
                <MenubarContent>
                  <MenubarItem>
                    <BookMarked /> Instructions
                  </MenubarItem>
                  <MenubarItem>
                    <Keyboard /> Shortcuts
                  </MenubarItem>
                  <MenubarItem>
                    <HelpCircle /> About
                  </MenubarItem>
                </MenubarContent>
              </MenubarMenu>
            </Menubar>
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant={"outline"}>
            <Download />
            Export as .md
          </Button>
          <Tooltip>
            <TooltipTrigger>
              <Button disabled className="bg-blue-500 hover:bg-blue-900">
                <Grid2X2Plus />
                Download
              </Button>
            </TooltipTrigger>
            <TooltipContent side={"bottom"}>Coming Soon</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
