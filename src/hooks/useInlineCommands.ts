import { useEffect } from "react";
import { useCreateBlockTooltip } from "@features/create-block";
import { useEvent } from "./useEvent";

export function useInlineCommands() {
  const [openCreateBlockTooltip] = useCreateBlockTooltip();

  const onKeyDown = useEvent((e: KeyboardEvent) => {
    openCreateBlockTooltip(e);
  });

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);
}
