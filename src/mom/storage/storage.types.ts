import type { MOMDocument } from "../types";

export type Document = {
  id: string;
  title: string;
  thumbnail: Blob | null;
  lastModified: number; //timestamp in ms

  isFavorite: boolean;
  isDisabled: boolean;
  isPinned: boolean;
} & Pick<MOMDocument, "nodes" | "rootOrder">;
