import type { MOMImage } from "@/mom/types";
import { useState } from "react";
import { useDocumentActions } from "./useDocumentActions";
import { toast } from "sonner";

/**
 * url - вставка url к удаленному ресурсу
 * custom - файл берем локально, ссылку указываем отдельную в зависимости от будущего местоположения картинки
 * b64 - локальная картинка в base65 (не рекомендуется потому что есть риск раздутия размера markdown)
 */
type UploadVariant = "url" | "custom" | "b64";
type Status = "idle" | "loading" | "success";

export function useImage(node: MOMImage) {
  const { removeNode, updateNode } = useDocumentActions();

  const [alt, setAlt] = useState(node.alt);
  const [url, setUrl] = useState(node.url);
  const [title, setTitle] = useState(node.title);
  const [linkUrl, setLinkUrl] = useState(node.linkUrl);

  const [variant, setVariant] = useState<UploadVariant>();
  const [status, setStatus] = useState<Status>("idle");

  function isValidUrl(url: string) {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  }

  const pasteFromClipboard = async () => {
    const value = await navigator.clipboard.readText();
    return value;
  };

  const selectVariant = async (variant?: UploadVariant) => {
    if (variant === "url") {
      const valueFromClipboard = await pasteFromClipboard();
      if (valueFromClipboard) {
        setUrl(valueFromClipboard);
      }
    }
    setVariant(variant);
  };

  const save = () => {
    if (!url) return;
    if (!isValidUrl(url)) {
      toast.error("Wrong URL");
      return;
    }
    setStatus("success");
    updateNode({
      nodeId: node.id,
      patch: {
        ...node,
        url,
      },
    });
  };

  const saveMeta = (opt: Pick<MOMImage, "alt" | "title" | "linkUrl">) => {
    setAlt(opt.alt || "");
    setTitle(opt.title || "");
    setLinkUrl(opt.linkUrl || "");
    updateNode({
      nodeId: node.id,
      patch: {
        ...node,
        ...opt,
        url,
      },
    });
    toast.success("Meta info saved");
  };

  const clearMeta = () => {
    setAlt("");
    setTitle("");
    setLinkUrl("");
  };

  const deleteImage = () => {
    removeNode(node.id);
  };

  const onImageLoadError = () => {
    toast.error("Image get error");
    updateNode({ nodeId: node.id, patch: { ...node, url: undefined } });
    cancel();
  };

  const cancel = () => {
    setAlt("");
    setUrl("");
    setTitle("");
    setVariant(undefined);
    setLinkUrl("");
    updateNode({
      nodeId: node.id,
      patch: {
        ...node,
        url: undefined,
        alt: undefined,
        title: undefined,
        linkUrl: undefined,
      },
    });
  };

  return {
    variant,
    url,
    setUrl,
    selectVariant,
    save,
    cancel,
    onImageLoadError,
    deleteImage,
    saveMeta,
    clearMeta,
  };
}
