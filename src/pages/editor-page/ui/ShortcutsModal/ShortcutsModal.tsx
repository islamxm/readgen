import {
  ArrowLeft,
  ArrowRight,
  Copy,
  CopyX,
  Redo2,
  Save,
  SquaresSubtract,
  SquareStack,
  SquaresUnite,
  Undo2,
} from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@shared/ui";
import { type FC } from "react";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const ShortcutsModal: FC<Props> = ({ open, setOpen }) => {

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading={"History & Sync"}>
            <CommandItem>
              <Undo2 />
              <span>Undo</span>
              <CommandShortcut>⌘ Z</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Redo2 />
              <span>Redo</span>
              <CommandShortcut>⌘ Shift Z</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <Save />
              <span>Save</span>
              <CommandShortcut>⌘ S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading={"Navigation"}>
            <CommandItem>
              <ArrowLeft />
              <span>Previous Block</span>
              <CommandShortcut>Shift Tab</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <ArrowRight />
              <span>Next Block</span>
              <CommandShortcut>Tab</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading={"Block Actions"}>
            <CommandItem>
              <SquareStack />
              <span>Select All</span>
              <CommandShortcut>⌘ Shift A</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <SquaresUnite />
              <span>Create New Block</span>
              <CommandShortcut>Enter</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CopyX />
              <span>Delete Block</span>
              <CommandShortcut>⌘ Shift Backspace</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading={"Clipboard"}>
            <CommandItem>
              <Copy />
              <span>Copy Block</span>
              <CommandShortcut>⌘ Shift C</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <SquaresSubtract />
              <span>Paste Block</span>
              <CommandShortcut>⌘ Shift V</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
};
