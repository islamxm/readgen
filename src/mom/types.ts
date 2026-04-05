export type MOMMap = Record<string, MOMAllContent>;
export type MOMGroupMeta = {
  id: string;
  label: string;
  order: number;
};
export type MOMGroupsMap = Record<string, MOMGroupMeta>;
export type MOMDocument = {
  rootOrder: Array<string>;
  nodes: MOMMap;
  groups: MOMGroupsMap;
};

export type MOMNode<Element = object> = {
  id: string;
  parentId: string | null;
  groupId?: string | null;
} & Element;

export type MOMAbstractParent = MOMNode<{
  children: Array<string>;
}>;

export type MOMAbstractLiteral = MOMNode<{
  value: string;
}>;
export type MOMTextMarks = {
  italic?: boolean;
  bold?: boolean;
  lineThrough?: boolean;
  link?: boolean;
};
export interface MOMBlockquote extends MOMAbstractParent {
  type: "blockquote";
}
export interface MOMAlert extends MOMAbstractParent {
  type: "alert";
  variant: "warning" | "tip" | "note" | "caution" | "important"
}
export interface MOMCode extends MOMAbstractLiteral {
  type: "code";
  lang?: string;
}
export interface MOMHeading extends MOMAbstractLiteral {
  type: "heading";
  depth: 1 | 2 | 3 | 4 | 5 | 6;
}
export interface MOMImage extends MOMNode {
  type: "image";
  url: string;
  alt?: string;
  title?: string;
  linkUrl?: string;
}
export interface MOMInlineCode extends MOMAbstractLiteral {
  type: "inlineCode";
}
export interface MOMList extends MOMAbstractParent {
  type: "list";
  ordered?: boolean;
  start?: number;
  spread?: boolean;
}
export interface MOMListItem extends MOMAbstractParent {
  type: "listItem";
  spread?: boolean;
}
export interface MOMParagraph extends MOMAbstractParent {
  type: "paragraph";
}
export interface MOMRoot extends MOMAbstractParent {
  type: "root";
}
export interface MOMText extends MOMAbstractLiteral {
  type: "text";
  marks: MOMTextMarks;
  url?: string;
}
export interface MOMThematicBreak extends MOMNode {
  type: "thematicBreak";
}
export interface MOMListItemGfm extends MOMListItem {
  checked?: boolean;
}

export type MOMParentNode =
  | MOMBlockquote
  | MOMParagraph
  | MOMList
  | MOMListItem;

export type MOMAllContent =
  | MOMBlockquote
  | MOMAlert
  | MOMCode
  | MOMHeading
  | MOMImage
  | MOMInlineCode
  | MOMList
  | MOMListItem
  | MOMParagraph
  | MOMRoot
  | MOMText
  | MOMThematicBreak
  | MOMListItemGfm;

export type MOMBlockNode =
  | MOMAlert
  | MOMParagraph
  | MOMBlockquote
  | MOMHeading
  | MOMList
  | MOMImage
  | MOMThematicBreak
  | MOMCode;

export type MOMInlineNode =
  | MOMText
  | MOMListItem
  | MOMParagraph
  | MOMInlineCode;

export type MOMNodeType = MOMAllContent["type"];
export type MOMBlockNodeType = MOMBlockNode["type"];
export type MOMInlineNodeType = MOMInlineNode["type"];
