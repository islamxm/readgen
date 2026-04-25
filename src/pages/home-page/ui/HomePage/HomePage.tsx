import { AppLayout } from "@widgets/app-layout";
import { DocumentCard } from "../DocumentCard/DocumentCard";
import { useStorageQuery } from "@/hooks";
import { getAllDocuments } from "@/mom/storage/storage";
import { DeleteDocumentIconButton } from "@features/delete-document";
import { CreateDocumentCard } from "@features/create-document";
import { DownloadMarkdownIconButton } from "@features/export-markdown";

export const HomePage = () => {
  const { isLoading, data } = useStorageQuery(getAllDocuments, []);

  return (
    <AppLayout>
      <title>ReadGen | Documents</title>
      <meta name="description" content="Custom WYSIWYG Markdown Editor" />
      <div className="flex-1 min-h-0 bg-white rounded-lg p-[15px] flex flex-col gap-[15px]">
        <h2 className="text-3xl">All Documents</h2>
        <div className="flex gap-[10px] flex-wrap">
          {isLoading && (
            <>
              <DocumentCard.Skeleton />
              <DocumentCard.Skeleton />
              <DocumentCard.Skeleton />
            </>
          )}
          {data && (
            <>
              <CreateDocumentCard />
              {data.map((document) => (
                <DocumentCard
                  key={document.id}
                  {...document}
                  extraActionsSlot={
                    <div className="flex gap-[5px]">
                      <DownloadMarkdownIconButton id={document.id} tooltip />
                      <DeleteDocumentIconButton id={document.id} tooltip/>
                    </div>
                  }
                />
              ))}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
