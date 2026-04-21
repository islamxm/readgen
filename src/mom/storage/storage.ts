import { db } from "./storage.model";

export const getDocument = async (id: string): Promise<Document | undefined> => {
  return await db.documents.get(id);
};
export const getAllDocuments = async (): Promise<Document[]> => {
  return await db.documents.orderBy("lastModified").reverse().toArray();
};
export const saveDocument = async (doc: Document): Promise<void> => {
  await db.documents.put(doc);
};
export const deleteDocument = async (id: string): Promise<void> => {
  await db.documents.delete(id);
};
export const updateDocument = async (id: string, patch: Partial<Document>): Promise<number> => {
  return await db.documents.update(id, patch);
};

export const Storage = {
  getDocument,
  getAllDocuments,
  saveDocument,
  deleteDocument,
  updateDocument,
};
