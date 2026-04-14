import { MOM } from "@/mom";
import { useDocumentActions } from "./useDocumentActions";

export function useCompositions() {
  const { insertNodes } = useDocumentActions();

  const createProjectHeroComposition = () => {
    const heading1 = {
      node: MOM.Engine.createHeading(1, null, "Title"),
      parentId: null,
    };
    const p = {
      node: MOM.Engine.createParagraph(null),
      parentId: null,
    };
    const pText = {
      node: MOM.Engine.createText("Description", p.node.id),
      parentId: p.node.id,
    };
    const image = {
      node: MOM.Engine.createImage(null),
      parentId: null,
    };

    insertNodes([heading1, p, pText, image]);
  };
  const createQuickInstallComposition = () => {
    const heading = {
      node: MOM.Engine.createHeading(2, null, "Quick Install"),
      parentId: null
    }
    const p = {
      node: MOM.Engine.createParagraph(null),
      parentId: null
    }
    const text = {
      node: MOM.Engine.createText("Description", p.node.id),
      parentId: p.node.id
    }
    const code = {
      node: MOM.Engine.createCode("bash", null, "npm install ..."),
      parentId: null
    }
    insertNodes([heading, p, text, code]);
  };
  const createFeatureShowcaseComposition = () => {};
  const createUsageSnippetComposition = () => {};

  return {
    createProjectHeroComposition,
    createQuickInstallComposition,
    createFeatureShowcaseComposition,
    createUsageSnippetComposition
  };
}
