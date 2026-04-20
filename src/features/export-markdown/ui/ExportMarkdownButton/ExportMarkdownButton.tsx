import { Button } from "@/ui/shared";
import { Download } from "lucide-react";
import { useExportMarkdown } from "../../lib/useExportMarkdown";

export const ExportMarkdownButton = () => {
  const { exportMarkdown } = useExportMarkdown();

  return (
    <Button onClick={exportMarkdown} className="bg-blue-500 hover:bg-blue-700 hover:shadow-[0_4px_24px_rgba(59,130,246,0.7)]">
      <Download />
      <span className="shimmer-text">Export as Markdown</span>
    </Button>
  );
};
