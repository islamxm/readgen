import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateDocumentModal } from "../CreateDocumentModal/CreateDocumentModal";

/** @deprecated */
export const CreateDocumentCard = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <>
      <CreateDocumentModal open={createModalOpen} setOpen={setCreateModalOpen} />
      <div
        onClick={() => setCreateModalOpen(true)}
        className="bg-white cursor-pointer border border-dashed border-blue-300 w-[200px] h-[280px] rounded-lg flex justify-center items-center gap-[10px] flex-col hover:shadow-md transition-all"
      >
        <Plus size={40} />
        <span className="text-lg">New Document</span>
      </div>
    </>
  );
};
