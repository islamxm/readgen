import { useDocumentActions } from "@/hooks";
import { MOM } from "@/mom";
import type { MOMDocumentEntity } from "@/mom/storage/storage.types";
import type { CommonStatus } from "@shared/model";
import { nanoid } from "nanoid";
import { useState, type HTMLProps } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export function useCreateDocument() {
  const navigate = useNavigate();
  const [documentTitle, setDocumentTitle] = useState("");
  const [status, setStatus] = useState<CommonStatus>("idle");
  const isLoading = status === "loading";
  const isError = status === "error";
  const isSuccess = status === "success";
  const isIdle = status === "idle";

  async function createNewDocument() {
    if(isLoading) return;
    setStatus("loading");
    const id = nanoid();
    const time = Date.now();
    const document: MOMDocumentEntity = {
      id,
      title: documentTitle ?? `README_${time}`,
      thumbnail: null,
      lastModified: time,
      isFavorite: false,
      isDisabled: false,
      isPinned: false,
      nodes: {},
      rootOrder: [],
      groups: {},
    };
    try {
      await MOM.Storage.createDocument(document);
      navigate(`/editor?id=${id}`);
      setStatus("success");
    } catch {
      setStatus("error");
      toast.error("An error occurred");
    }
  }

  function onDocumentTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDocumentTitle(e.target.value);
  }

  function reset() {
    setDocumentTitle("");
    setStatus("idle");
  }

  const inputProps: HTMLProps<HTMLInputElement> = {
    value: documentTitle,
    onChange: onDocumentTitleChange,
  };

  return {
    createNewDocument,
    isLoading,
    isError,
    isSuccess,
    isIdle,
    inputProps,
    reset
  };
}
