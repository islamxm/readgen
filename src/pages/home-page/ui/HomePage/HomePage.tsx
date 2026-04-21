import { AppLayout } from "@/widgets/app-layout";
import { Sidebar } from "../Sidebar/Sidebar";

export const HomePage = () => {
  return (
    <AppLayout
      sidebar={<Sidebar/>}
      >
      <div className="flex-1 min-h-0 bg-white rounded-lg"></div>
    </AppLayout>
  )
}