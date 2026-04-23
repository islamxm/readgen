import type { MOMDocument } from "../types";

export type MOMDocumentEntity = {
  id: string;
  title: string;
  thumbnail: Blob | null;
  lastModified: number; //timestamp in ms

  isFavorite: boolean;
  isDisabled: boolean;
  isPinned: boolean;
} & MOMDocument;

export type CreateDocumentPayload = Pick<MOMDocumentEntity, "title">;
