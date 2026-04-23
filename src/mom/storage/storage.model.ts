import Dexie, { type Table } from "dexie";
import type { MOMDocumentEntity } from "./storage.types";
const DB_VERSION = 1;
const DB_NAME = "readgen";

class DB extends Dexie {
  documents!: Table<MOMDocumentEntity, string>;
  constructor() {
    super(DB_NAME);

    this.version(DB_VERSION).stores({
      documents: "id, lastModified",
    });
  }
}

export const db = new DB();