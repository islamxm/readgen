import { Button } from "@/ui/shared";
import { Download } from "lucide-react";
import { useExportMarkdown } from "../../lib/useExportMarkdown";

export const ExportMarkdownButton = () => {
  const { exportMarkdown } = useExportMarkdown();

  return (
    <Button onClick={exportMarkdown} className="bg-blue-500 hover:bg-blue-900">
      <Download />
      Export as .md
    </Button>
  );
};
