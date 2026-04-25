import type { FC } from "react";
import logo from "@shared/assets/logo.svg";
import clsx from "clsx";

type Props = {
  disableHatchingBg?: boolean;
};
export const Logo: FC<Props> = ({ disableHatchingBg }) => {
  return (
    <div className={clsx("w-[53px] logo flex justify-center items-center flex-none", !disableHatchingBg && "hatching")}>
      <img src={logo} width={40} height={40} alt="Readgen" className="flex" />
    </div>
  );
};
