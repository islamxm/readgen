import { Button, DropdownMenu, DropdownMenuTrigger, Tooltip, TooltipContent, TooltipTrigger } from "@/ui/shared";
import { Puzzle } from "lucide-react";
import { CompositionsMenu } from "../CompositionsMenu/CompositionsMenu";
import { CompositionItem } from "../CompositionItem/CompositionItem";
import { useCompositions } from "../../lib/useCompositions";
export const CompositionMenuButton = () => {
  const {
    projectHeroComposition,
    quickInstallComposition,
    featureShowCaseComposition,
    usageSnippetComposition,
    techStackGridComposition,
    contributingAndLicenceComposition,
  } = useCompositions();
  
  return (
    <Tooltip>
      <DropdownMenu>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button size={"icon"} className="bg-blue-500 hover:bg-blue-900">
              <Puzzle />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side={"right"}>Compositions</TooltipContent>
        <CompositionsMenu>
          <CompositionItem {...projectHeroComposition} />
          <CompositionItem {...quickInstallComposition} />
          <CompositionItem {...featureShowCaseComposition} />
          <CompositionItem {...usageSnippetComposition} />
          <CompositionItem {...techStackGridComposition} />
          <CompositionItem {...contributingAndLicenceComposition} />
        </CompositionsMenu>
      </DropdownMenu>
    </Tooltip>
  );
};
