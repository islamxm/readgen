import { AppLayout } from "@/widgets/app-layout";
import { Sidebar } from "../Sidebar/Sidebar";
import { DocumentCard } from "../DocumentCard/DocumentCard";
import { useStorageQuery } from "@/hooks";
import { getAllDocuments } from "@/mom/storage/storage";
import { DeleteDocumentIconButton } from "@/features/delete-document";

export const HomePage = () => {
  const { isLoading, data } = useStorageQuery(getAllDocuments, []);

  return (
    <AppLayout sidebar={<Sidebar />}>
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
              {data.map((document) => (
                <DocumentCard
                  key={document.id}
                  {...document}
                  extraActionsSlot={
                    <>
                      <DeleteDocumentIconButton id={document.id} />
                    </>
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
