import { FilePlus, Redo2, Undo2 } from "lucide-react";
import { Button } from "@shared/ui";
import { useHistory } from "@/hooks";

import { ExportMarkdownButton } from "@/features/export-markdown";
import { Menu } from "../Menu/Menu";

export const TopToolbar = () => {
  const { undo, redo } = useHistory();

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
        <Menu />
      </div>
      <div className="flex gap-1">
        <ExportMarkdownButton />
      </div>
    </div>
  );
};
