import { Button, type ButtonProps } from "@shared/ui";
import { Plus } from "lucide-react";
import { useState, type FC, type PropsWithChildren } from "react";
import { CreateDocumentModal } from "../CreateDocumentModal/CreateDocumentModal";

type Props = PropsWithChildren<Pick<ButtonProps, "variant">>;

export const CreateDocumentButton: FC<Props> = ({ children, variant = "default" }) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <>
      <CreateDocumentModal open={createModalOpen} setOpen={setCreateModalOpen} />
      <Button onClick={() => setCreateModalOpen(true)} variant={variant}>
        {children ?? (
          <>
            <Plus /> New Document
          </>
        )}
      </Button>
    </>
  );
};
