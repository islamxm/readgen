import { useEffect } from "react";
import { useCreateBlockTooltip } from "@features/create-block";
import { useCreateEmojiTooltip } from "@/features/create-emoji";
import { useEvent } from "./useEvent";

export function useInlineCommands() {
  const [openCreateBlockTooltip] = useCreateBlockTooltip();
  const [openCreateEmojiTooltip] = useCreateEmojiTooltip();

  const onKeyDown = useEvent((e: KeyboardEvent) => {
    openCreateBlockTooltip(e);
    openCreateEmojiTooltip(e);
  });

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);
}
