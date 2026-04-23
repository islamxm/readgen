import { db } from "./storage.model";
import type { CreateDocumentPayload, MOMDocumentEntity } from "./storage.types";

export const getDocument = async (id: string): Promise<MOMDocumentEntity | undefined> => {
  return await db.documents.get(id);
};
export const getAllDocuments = async (): Promise<MOMDocumentEntity[]> => {
  return await db.documents.orderBy("lastModified").reverse().toArray();
};
export const saveDocument = async (doc: MOMDocumentEntity): Promise<void> => {
  await db.documents.put(doc);
};
export const deleteDocument = async (id: string): Promise<void> => {
  await db.documents.delete(id);
};
export const updateDocument = async (id: string, patch: Partial<MOMDocumentEntity>): Promise<number> => {
  return await db.documents.update(id, patch);
};
export const createDocument = async (payload: MOMDocumentEntity) => {
  await db.documents.add(payload);
};

export const Storage = {
  getDocument,
  getAllDocuments,
  saveDocument,
  deleteDocument,
  updateDocument,
  createDocument,
};
