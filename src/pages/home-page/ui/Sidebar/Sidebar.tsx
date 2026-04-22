import { Button, Separator } from "@/shared/ui";
import { Bookmark, FileHeart, FilePlus, Files, Heart, Plus, Settings } from "lucide-react";
import { useNavigate } from "react-router";

export const Sidebar = () => {
  const nav = useNavigate();
  return (
    <div className="bg-white min-h-0 flex flex-col rounded-lg w-[250px] gap-[10px] p-[15px]">
      <Button onClick={() => nav("/editor")}>
        <Plus /> New Document
      </Button>
      <Button variant={"outline"}>
        <Files /> All Documents
      </Button>
    </div>
  );
};
