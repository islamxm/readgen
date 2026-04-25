import type { FC, ReactNode } from "react";
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

  const goToDocument = () => {
    navigate(`/editor?id=${id}`);
  };

  return (
    <div
      onClick={goToDocument}
      className="group overflow-hidden relative rounded-lg border w-[200px] h-[280px] bg-white cursor-pointer hover:shadow-md transition-all"
    >
      {extraActionsSlot && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-0 right-0 w-full p-[10px] flex justify-end opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {extraActionsSlot}
        </div>
      )}
      <div className="thumbnail aspect-3/3 rounded-lg overflow-hidden">
        {!thumbnail && <div className="hatching aspect-3/3 flex justify-center items-center text-[100px] text-blue-300">{imagePlaceholderWord}</div>}
      </div>

      <div className="p-[10px] flex flex-col gap-[5px]">
        <span className="text-lg font-bold truncate">{title}</span>
        <span className="text-sm text-gray-400">{lastModifiedRelativeDate}</span>
      </div>
    </div>
  );
};

DocumentCard.Skeleton = DocumentCardSkeleton;
