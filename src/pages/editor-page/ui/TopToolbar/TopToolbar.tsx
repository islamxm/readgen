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
  Logo,
} from "@shared/ui";
import { useDocumentActions, useHistory } from "@/hooks";
import { useUI } from "@/hooks";
import { ExportMarkdownButton } from "@/features/export-markdown";

export const TopToolbar = () => {
  const { undo, redo } = useHistory();
  const { toggleBlockHighlighting, blockHighlighting } = useUI();
  const { clearDocument } = useDocumentActions();

  return (
    <div className="flex p-2 gap-1 justify-between flex-1 bg-white">
      <div className="flex gap-1">
        <div className="flex gap-1">
          <Button>
            <FilePlus />
            New File
          </Button>
          <Button onClick={undo} size={"icon"}>
            <Undo2 />
          </Button>
          <Button onClick={redo} size={"icon"}>
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
                  <SquareStack /> {blockHighlighting ? "Disable" : "Enable"} block highlighting
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem disabled>
                  <BrushCleaning /> Clear all
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Help</MenubarTrigger>
              <MenubarContent>
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
        <ExportMarkdownButton />
      </div>
    </div>
  );
};
