import { Header } from "../Header/Header"
import type { FC, PropsWithChildren, ReactNode } from "react";

type Props = PropsWithChildren<{
  sidebar?: ReactNode;
  header?: ReactNode;
}>;

export const AppLayout:FC<Props> = ({
  sidebar,
  header,
  children
}) => {
  return (
    <div className="h-screen flex flex-col">
      <Header>{header}</Header>
      <div className="flex gap-[15px] p-[15px] min-h-0 flex-1">
        {sidebar}
        <div className="flex flex-1 min-h-0">{children}</div>
      </div>
    </div>
  )
}