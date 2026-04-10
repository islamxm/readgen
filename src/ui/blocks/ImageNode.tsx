import { useImage, useNode } from "@/hooks";
import { MOM } from "@/mom";
import type { MOMImage } from "@/mom/types";
import { useState, type FC } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
  Spinner,
} from "../shared";
import { Check, Link, MoreVertical, Trash2, XIcon } from "lucide-react";

type Props = {
  nodeId: string;
};

export const ImageNode: FC<Props> = ({ nodeId }) => {
  const node = useNode(nodeId) as MOMImage;
  const isValidNode = MOM.Guard.isImageNode(node);
  const {
    url,
    variant,
    selectVariant,
    save,
    cancel,
    setUrl,
    onImageLoadError,
    deleteImage,
    saveMeta,
  } = useImage(node);

  if (!isValidNode) return null;

  return (
    <div>
      {node.url ? (
        <Preview
          init={{ alt: node.alt, linkUrl: node.linkUrl, title: node.title }}
          url={node.url}
          onError={onImageLoadError}
          onDelete={deleteImage}
          onMetaSave={saveMeta}
        />
      ) : (
        <div className="gap-2 p-4 flex justify-center items-center">
          {!variant && (
            <Button onClick={() => selectVariant("url")}>
              <Link /> Paste URL
            </Button>
          )}
          {variant === "url" && (
            <div className="flex gap-2">
              <Input
                className="bg-white"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
              <Button onClick={save}>
                <Check /> Done
              </Button>
              <Button onClick={cancel}>
                <XIcon /> Cancel
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Preview: FC<{
  init: Pick<MOMImage, "alt" | "title" | "linkUrl">;
  url: string;
  onError?: any;
  onDelete?: any;
  onMetaSave?: any;
}> = ({ init, url, onError, onDelete, onMetaSave }) => {
  const [alt, setAlt] = useState(init.alt);
  const [title, setTitle] = useState(init.title);
  const [linkUrl, setLinkUrl] = useState(init.linkUrl);
  const [isLoading, setIsLoading] = useState(true);

  const isLink = !!init.linkUrl;

  const metaSave = () => {
    onMetaSave?.({
      alt,
      title,
      linkUrl,
    });
  };

  const goToExternalLink = () => {
    if (!init.linkUrl) return;
    window.open(init.linkUrl);
  };

  return (
    <div className="relative min-h-[56px]">
      <div className="flex gap-1 absolute right-0 top-0 p-[10px]">
        {isLink && (
          <Button className="shadow-none" onClick={goToExternalLink}>
            <Link /> {init.linkUrl}
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button size={"icon"} variant={"secondary"}>
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[300px]" side="bottom">
            <div className="flex flex-col gap-[5px] p-[10px]">
              <h5>Image meta info</h5>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
              />
              <Input
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Alternative"
              />
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                type={"url"}
                placeholder="Link URL"
              />
              <Button onClick={metaSave}>Save</Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          onClick={(e) => {
            e.preventDefault();
            onDelete();
          }}
          size={"icon"}
          variant={"destructive"}
        >
          <Trash2 />
        </Button>
      </div>
      {isLoading && (
        <div className="absolute inset-0 flex justify-center items-center">
          <Spinner />
        </div>
      )}
      <img
        onLoad={() => setIsLoading(false)}
        className="rounded-sm overflow-hidden"
        src={url}
        alt={alt}
        onError={onError}
      />
    </div>
  );
};
