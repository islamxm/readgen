import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldGroup,
  Input,
  Label,
  Button,
} from "@shared/ui";
import { type FC } from "react";
import { useCreateDocument } from "../../lib/useCreateDocument";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export const CreateDocumentModal: FC<Props> = ({ open, setOpen }) => {
  const { createNewDocument, isLoading, inputProps, reset } = useCreateDocument();

  const onModalClose = (open: boolean) => {
    setOpen(open);
    if (!open) {
      reset();
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createNewDocument();
  };

  return (
    <Dialog open={open} onOpenChange={onModalClose}>
      <DialogContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-[20px]">
          <DialogTitle>Create New Document</DialogTitle>
          <FieldGroup>
            <Field>
              <Label htmlFor="document-title">Document title</Label>
              <Input id="document-title" name="document-title" {...inputProps} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type={"submit"} loading={isLoading}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
