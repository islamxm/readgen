import { AppLayout } from "@/widgets/app-layout";
import { Sidebar } from "../Sidebar/Sidebar";
import { DocumentCard } from "../DocumentCard/DocumentCard";
import { CreateDocumentCard } from "@/features/create-document";

export const HomePage = () => {
  return (
    <AppLayout sidebar={<Sidebar />}>
      <div className="flex-1 min-h-0 bg-white rounded-lg p-[15px] flex flex-col gap-[15px]">
        {/* title */}
        <h2 className="text-3xl">All Documents</h2>
        {/* doc list */}
        <div className="flex gap-[10px] wrap">
          <CreateDocumentCard/>
          <DocumentCard />
        </div>
      </div>
    </AppLayout>
  );
};
