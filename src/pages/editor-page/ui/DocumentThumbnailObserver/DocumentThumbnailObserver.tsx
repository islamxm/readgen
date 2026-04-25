import { useDocument } from "@/hooks";
import { useEffect, type FC, type RefObject } from "react";
import { useDebounceValue } from "usehooks-ts";
import { domToBlob } from "modern-screenshot";
import { MOM } from "@/mom";

type Props = {
  containerRef: RefObject<HTMLDivElement | null>;
};

export const DocumentThumbnailObserver: FC<Props> = ({ containerRef }) => {
  const { doc, id } = useDocument();

  const [debDoc] = useDebounceValue(doc, 3000);

  useEffect(() => {
    const makeThumbnail = async () => {
      if (!containerRef.current || !id) return;
      const { width } = containerRef.current.getBoundingClientRect();
      const isDocEmpty = containerRef.current.children.length === 0;
      const thumbnail = isDocEmpty ? null : await domToBlob(containerRef.current, { scale: 0.3, width, height: width });
      await MOM.Storage.updateDocument(id, { thumbnail });
    };

    makeThumbnail();
  }, [debDoc, id, containerRef]);
};
