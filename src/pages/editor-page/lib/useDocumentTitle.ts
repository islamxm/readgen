import { useStorageQuery } from "@/hooks";
import { MOM } from "@/mom";
import { useSearchParams } from "react-router";

export function useDocumentTitle() {
  const [params] = useSearchParams();
  const id = params.get("id") || "";

  const {data} = useStorageQuery(MOM.Storage.getDocument, [id]);
  const title = data?.title ?? "";

  return {
    title,
    // тут будет логика редактирования тайтла
  }
}