import { Button } from "@/shared/ui";
import { useDocumentTitle } from "../../lib/useDocumentTitle";

export const DocumentTitle = () => {
  const { title } = useDocumentTitle();

  if (!title) return null;

  return (
    <Button variant={"outline"} className="basis-[250px] shrink truncate justify-start gap-0">
      <span className="truncate">{title}</span>.md
    </Button>
  );
};
