import { Button } from "@shared/ui";
import { Trash2 } from "lucide-react";
import { MOM } from "@/mom";
import { useEffect, type FC } from "react";
import { useStorageMutation } from "@/hooks";
import { toast } from "sonner";

type Props = {
  id: string;
};

export const DeleteDocumentIconButton: FC<Props> = ({ id }) => {
  const [deleteDoc, { isLoading, isError }] = useStorageMutation(MOM.Storage.deleteDocument);

  useEffect(() => {
    if (isError) {
      toast.error("Could not delete document", {
        description: "An error occurred while accessing the database.",
      });
    }
  }, [isError]);

  return (
    <Button variant={"destructive"} onClick={() => deleteDoc(id)} loading={isLoading} size={"icon"}>
      <Trash2 />
    </Button>
  );
};
