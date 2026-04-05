import { nanoid } from "nanoid";
import type {
  MOMAlert,
  MOMBlockNodeType,
  MOMBlockquote,
  MOMCode,
  MOMHeading,
  MOMImage,
  MOMInlineCode,
  MOMList,
  MOMListItem,
  MOMNode,
  MOMParagraph,
  MOMText,
  MOMThematicBreak,
} from "../types";
import type { MOMCreateParams, MOMCreateResult } from "./engine.types";

function base(parentId: string | null): Omit<MOMNode, "groupId"> {
  return { parentId, id: nanoid() };
}

export function createParagraph(parentId: string | null = null): MOMParagraph {
  return {
    ...base(parentId),
    type: "paragraph",
    children: [],
  };
}

export function createHeading(
  depth: MOMHeading["depth"],
  parentId: string | null = null,
  value: string = "",
): MOMHeading {
  return {
    ...base(parentId),
    type: "heading",
    depth,
    value,
  };
}

export function createCode(
  lang: string = "",
  parentId: string | null = null,
): MOMCode {
  return {
    ...base(parentId),
    type: "code",
    lang,
    value: "",
  };
}

export function createImage(parentId: string | null = null): MOMImage {
  return {
    ...base(parentId),
    type: "image",
    url: "",
    alt: "",
    title: "",
    linkUrl: ""
  };
}

export function createList(
  ordered: boolean = false,
  parentId: string | null = null,
): MOMList {
  return {
    ...base(parentId),
    type: "list",
    ordered,
    children: [],
  };
}

export function createListItem(parentId: string): MOMListItem {
  return {
    ...base(parentId),
    type: "listItem",
    children: [],
  };
}

export function createBlockquote(
  parentId: string | null = null,
): MOMBlockquote {
  return {
    ...base(parentId),
    type: "blockquote",
    children: [],
  };
}

export function createAlert(
  parentId: string | null = null,
  variant: MOMAlert["variant"] = "important",
): MOMAlert {
  return {
    ...base(parentId),
    type: "alert",
    variant,
    children: [],
  };
}

export function createThematicBreak(
  parentId: string | null = null,
): MOMThematicBreak {
  return {
    ...base(parentId),
    type: "thematicBreak",
  };
}

export function createText(
  value: string = "",
  parentId: string | null = null,
): MOMText {
  return {
    ...base(parentId),
    type: "text",
    value,
    marks: {},
  };
}

export function createInlineCode(
  value: string = "",
  parentId: string | null = null,
): MOMInlineCode {
  return {
    ...base(parentId),
    type: "inlineCode",
    value,
  };
}

export function create<T extends keyof MOMCreateParams>(
  type: T,
  params: MOMCreateParams[T] = {} as MOMCreateParams[T],
): MOMCreateResult[T] {
  switch (type) {
    case "paragraph":
      return createParagraph(
        (params as MOMCreateParams["paragraph"]).parentId,
      ) as MOMCreateResult[T];
    case "heading": {
      const p = params as MOMCreateParams["heading"];
      return createHeading(p.depth, p.parentId, p.value) as MOMCreateResult[T];
    }
    case "code":
      return createCode(
        (params as MOMCreateParams["code"]).lang,
        (params as MOMCreateParams["code"]).parentId,
      ) as MOMCreateResult[T];
    case "image":
      return createImage(
        (params as MOMCreateParams["image"]).parentId,
      ) as MOMCreateResult[T];
    case "list": {
      const p = params as MOMCreateParams["list"];
      return createList(p.ordered, p.parentId) as MOMCreateResult[T];
    }
    case "listItem":
      return createListItem(
        (params as MOMCreateParams["listItem"]).parentId,
      ) as MOMCreateResult[T];
    case "blockquote":
      return createBlockquote(
        (params as MOMCreateParams["blockquote"]).parentId,
      ) as MOMCreateResult[T];
    case "alert":
      return createAlert(
        (params as MOMCreateParams["alert"]).parentId,
      ) as MOMCreateResult[T];
    case "thematicBreak":
      return createThematicBreak(
        (params as MOMCreateParams["thematicBreak"]).parentId,
      ) as MOMCreateResult[T];
    case "text": {
      const p = params as MOMCreateParams["text"];
      return createText(p.value, p.parentId) as MOMCreateResult[T];
    }
    case "inlineCode": {
      const p = params as MOMCreateParams["inlineCode"];
      return createInlineCode(p.value, p.parentId) as MOMCreateResult[T];
    }
    default:
      throw new Error(`Unknown type: ${type}`);
  }
}
