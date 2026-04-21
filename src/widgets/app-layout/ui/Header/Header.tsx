import { Logo } from "@shared/ui"
import type { FC, PropsWithChildren } from "react"

export const Header:FC<PropsWithChildren> = ({children}) => {
  return (
    <div className="flex h-[55px] bg-white border-b">
      <Logo disableHatchingBg/>
      {children}
    </div>
  )
}