import { useInitDocument } from "../../lib/useInitDocument";
import { Canvas } from "../Canvas/Canvas";
import { CanvasMap } from "../CanvasMap/CanvasMap";
import { EditorToolbar } from "../EditorToolbar/EditorToolbar";
import { TopToolbar } from "../TopToolbar/TopToolbar";
import { AppLayout } from "@widgets/app-layout";

export const EditorPage = () => {
  const {isLoading, isError} = useInitDocument();

  return (
    <AppLayout disabled={isLoading || isError}  header={<TopToolbar />} sidebar={<EditorToolbar />}>
      <title>ReadGen | Editor</title>
      <meta name="description" content="Custom WYSIWYG Markdown Editor" />
      <div className={"gap-[15px] flex-1 flex min-h-0"}>
        <Canvas />
        <CanvasMap />
      </div>
    </AppLayout>
  );
};
