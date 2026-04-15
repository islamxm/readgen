import { useDocument } from "@/hooks";
import { MOM } from "@/mom";

export function useExportMarkdown() {
  const { rootOrder, nodes } = useDocument();

  const exportMarkdown = () => {
    const resultMarkdownString = MOM.Serializer.momToMarkdown(rootOrder, nodes);
    const blob = new Blob([resultMarkdownString], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "test.md";
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    exportMarkdown,
  };
}
