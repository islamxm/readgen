import { MOM } from "@/mom";
import { useDocumentActions } from "@/hooks";
import type { ReactNode } from "react";
import { ContributingIcon, FeatureShowcaseIcon, ProjectHeroIcon, QuickInstallIcon, TechStackGrid, UsageSnippetIcon } from "../ui/icons";

type Composition = {
  title: string;
  descr: string;
  create: () => void;
  icon?: ReactNode;
};

export function useCompositions() {
  const { insertNodes } = useDocumentActions();

  const projectHeroComposition: Composition = {
    title: "Project Hero",
    descr: "A high-impact header section to introduce your project and make a strong first impression",
    icon: <ProjectHeroIcon />,
    create: () => {
      const heading1 = {
        node: MOM.Engine.createHeading(1, null, "Awesome Project Name"),
        parentId: null,
      };
      const p = {
        node: MOM.Engine.createParagraph(null),
        parentId: null,
      };
      const pText = {
        node: MOM.Engine.createText(
          "A brief, catchy one-sentence tagline that explains exactly what your project does and why it matters.",
          p.node.id,
        ),
        parentId: p.node.id,
      };
      const image = {
        node: MOM.Engine.createImage(null),
        parentId: null,
      };

      insertNodes([heading1, p, pText, image]);
    },
  };

  const quickInstallComposition: Composition = {
    title: "Quick Install",
    descr: "A streamlined guide for users to get the project up and running in seconds.",
    icon: <QuickInstallIcon />,
    create: () => {
      const heading = {
        node: MOM.Engine.createHeading(2, null, "Getting Started"),
        parentId: null,
      };
      const p = {
        node: MOM.Engine.createParagraph(null),
        parentId: null,
      };
      const text = {
        node: MOM.Engine.createText("Install the package via your preferred package manager to start using it in your project:", p.node.id),
        parentId: p.node.id,
      };
      const code = {
        node: MOM.Engine.createCode("bash", null, "npm install awesome-project-name"),
        parentId: null,
      };
      insertNodes([heading, p, text, code]);
    },
  };

  const featureShowCaseComposition: Composition = {
    title: "Feature Showcase",
    descr: "Highlight the core capabilities and unique selling points of your software.",
    icon: <FeatureShowcaseIcon />,
    create: () => {
      const heading = {
        node: MOM.Engine.createHeading(2, null, "Key Features"),
        parentId: null,
      };
      const list = {
        node: MOM.Engine.createList(false, null),
        parentId: null,
      };
      const listItem = {
        node: MOM.Engine.createListItem(list.node.id),
        parentId: list.node.id,
      };
      const listItemTextBold = {
        node: MOM.Engine.createText("Type Safety: ", listItem.node.id, { bold: true }),
        parentId: listItem.node.id,
      };
      const listItemTextNormal = {
        node: MOM.Engine.createText("Fully written in TypeScript for a robust developer experience.", listItem.node.id),
        parentId: listItem.node.id,
      };
      insertNodes([heading, list, listItem, listItemTextBold, listItemTextNormal]);
    },
  };

  const usageSnippetComposition: Composition = {
    title: "Usage Snippet",
    descr: "A clear, functional code example demonstrating how to implement the project.",
    icon: <UsageSnippetIcon />,
    create: () => {
      const heading = {
        node: MOM.Engine.createHeading(2, null, "Basic Usage"),
        parentId: null,
      };
      const p = {
        node: MOM.Engine.createParagraph(null),
        parentId: null,
      };
      const text = {
        node: MOM.Engine.createText("Here is a simple example of how to initialize and use the core engine:", p.node.id),
        parentId: p.node.id,
      };
      const code = {
        node: MOM.Engine.createCode(
          "javascript",
          null,
          `import { Core } from 'awesome-project';\n\nconst app = new Core({\n\tdebug: true,\n\ttheme: 'dark'\n});\n\napp.init();
          `,
        ),
        parentId: null,
      };
      insertNodes([heading, p, text, code]);
    },
  };

  const techStackGridComposition: Composition = {
    title: "Tech Stack Grid",
    descr: "A visual or list-based overview of the technologies and tools powering your project.",
    icon: <TechStackGrid />,
    create: () => {
      const h = {
        node: MOM.Engine.createHeading(2, null, "Built With"),
        parentId: null,
      };
      const list = {
        node: MOM.Engine.createList(false, null),
        parentId: null,
      };
      const listItem = {
        node: MOM.Engine.createListItem(list.node.id),
        parentId: list.node.id,
      };
      const listItemTextBold = {
        node: MOM.Engine.createText("Type Safety: ", listItem.node.id, { bold: true }),
        parentId: listItem.node.id,
      };
      const listItemTextNormal = {
        node: MOM.Engine.createText("Fully written in TypeScript for a robust developer experience.", listItem.node.id),
        parentId: listItem.node.id,
      };
      insertNodes([h, list, listItem, listItemTextBold, listItemTextNormal]);
    },
  };

  const contributingAndLicenceComposition: Composition = {
    title: "Contributing & License",
    descr: "Essential information regarding collaboration guidelines and legal usage terms.",
    icon: <ContributingIcon />,
    create: () => {
      const h = {
        node: MOM.Engine.createHeading(2, null, "Contributing"),
        parentId: null,
      };
      const p = {
        node: MOM.Engine.createParagraph(null),
        parentId: null,
      };
      const text = {
        node: MOM.Engine.createText(
          "Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.",
          p.node.id,
        ),
        parentId: p.node.id,
      };
      const h2 = {
        node: MOM.Engine.createHeading(2, null, "License"),
        parentId: null,
      };
      const p2 = {
        node: MOM.Engine.createParagraph(null),
        parentId: null,
      };
      const text2 = {
        node: MOM.Engine.createText("This project is licensed under the MIT License. See the LICENSE file for more details.", p2.node.id),
        parentId: p2.node.id,
      };
      insertNodes([h, p, text, h2, p2, text2]);
    },
  };

  return {
    projectHeroComposition,
    quickInstallComposition,
    featureShowCaseComposition,
    usageSnippetComposition,
    techStackGridComposition,
    contributingAndLicenceComposition,
  };
}
