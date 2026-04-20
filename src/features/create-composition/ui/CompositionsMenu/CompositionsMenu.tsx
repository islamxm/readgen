import { DropdownMenuContent } from "@/ui/shared";
import type { FC, PropsWithChildren } from "react";

export const CompositionsMenu: FC<PropsWithChildren> = ({ children }) => {
  return (
    <DropdownMenuContent className="py-0" side={"right"}>
      {children}
    </DropdownMenuContent>
  );
};
