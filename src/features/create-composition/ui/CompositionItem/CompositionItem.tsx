import { Button } from "@/ui/shared";
import type { FC, ReactNode } from "react";

type Props = {
  title: string;
  descr: string;
  icon?: ReactNode;
  create?: () => void;
};

export const CompositionItem: FC<Props> = ({ title, descr, create, icon }) => {
  return (
    <Button
      onClick={create}
      variant={"outline"}
      className="flex min-h-auto h-[100px] w-[300px] justify-start items-center text-left whitespace-normal my-[5px]"
    >
      <div className="w-[50px] h-[50px]">{icon}</div>
      {/* body */}
      <div className="flex-1 flex flex-col gap-[5px]">
        <span className="text-lg">{title}</span>
        <span className="text-xs text-gray-400">{descr}</span>
      </div>
    </Button>
  );
};
