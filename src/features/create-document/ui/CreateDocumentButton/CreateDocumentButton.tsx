import { Button } from "@shared/ui";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateDocumentModal } from "../CreateDocumentModal/CreateDocumentModal";

export const CreateDocumentButton = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <>
      <CreateDocumentModal open={createModalOpen} setOpen={setCreateModalOpen} />
      <Button onClick={() => setCreateModalOpen(true)}>
        <Plus /> New Document
      </Button>
    </>
  );
};
