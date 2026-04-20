import { Button } from "@/ui/shared"
import { Trash2 } from "lucide-react"

export const DeleteBlockIconButton = () => {
  return (
    <Button variant={"destructive"} size={"icon"} className="rounded-full">
      <Trash2/>
    </Button>
  )
}