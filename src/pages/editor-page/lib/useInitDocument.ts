import { useDocumentActions } from "@/hooks";
import { MOM } from "@/mom";
import type { CommonStatus } from "@/shared/model";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router";

export function useInitDocument() {
  const { initiateDocument } = useDocumentActions();
  const [params] = useSearchParams();
  const id = params.get("id");
  const [status, setStatus] = useState<CommonStatus>("idle");

  const isLoading = status === "loading";
  const isError = status === "error";
  const isSuccess = status === "success";

  useEffect(() => {
    if (!id) {
      return;
    }
    MOM.Storage.getDocument(id)
      .then((res) => {
        if (res) {
          initiateDocument(res, id);
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => {
        setStatus("error");
      });
  }, [id, initiateDocument]);

  return {isSuccess, isLoading};
}
