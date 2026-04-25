import { useEffect, useState, type FC, type ReactNode } from "react";
import { DocumentCardSkeleton } from "./DocumentCard.skeleton";
import type { MOMDocumentEntity } from "@/mom/storage/storage.types";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/en";
import { useNavigate } from "react-router";

dayjs.extend(relativeTime);
dayjs.locale("en");

type Props = FC<MOMDocumentEntity & { extraActionsSlot?: ReactNode }> & {
  Skeleton: typeof DocumentCardSkeleton;
};

const getLastModifiedRelativeDate = (lastModified: number) => {
  const date = dayjs(lastModified);
  const now = dayjs();

  if (now.diff(date, "day") > 5) {
    return date.format("DD.MM.YYYY");
  }
  return date.fromNow();
};

export const DocumentCard: Props = ({ id, title, lastModified, thumbnail, extraActionsSlot }) => {
  const navigate = useNavigate();
  const lastModifiedRelativeDate = getLastModifiedRelativeDate(lastModified);
  const imagePlaceholderWord = !thumbnail && title[0].toUpperCase();
  const url = thumbnail ? URL.createObjectURL(thumbnail) : null;

  useEffect(() => {
    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [thumbnail, url]);

  const goToDocument = () => {
    navigate(`/editor?id=${id}`);
  };

  return (
    <div
      onClick={goToDocument}
      className="group overflow-hidden relative rounded-lg w-[200px] h-[280px] bg-white cursor-pointer shadow-sm hover:shadow-md transition-all"
    >
      {extraActionsSlot && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-0 right-0 w-full p-[10px] flex justify-end opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {extraActionsSlot}
        </div>
      )}
      <div className="thumbnail aspect-3/3 rounded-lg overflow-hidden bg-blue-50 p-[10px] border">
        {url && <img className="w-full h-full rounded-md object-cover" src={url} alt={title}/>}
        {!url && <div className="hatching rounded-md aspect-3/3 flex justify-center items-center text-[100px] text-blue-300">{imagePlaceholderWord}</div>}
      </div>

      <div className="p-[10px] flex flex-col gap-[5px]">
        <span className="text-lg font-bold truncate">{title}</span>
        <span className="text-sm text-gray-400">{lastModifiedRelativeDate}</span>
      </div>
    </div>
  );
};

DocumentCard.Skeleton = DocumentCardSkeleton;
