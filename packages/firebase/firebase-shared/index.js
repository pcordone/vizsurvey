import { getId, getServerSequenceId } from "./src/firebase.js";
import {
  initAdminFirestoreDB,
  initBatch,
  setBatchItem,
  deleteDocs,
  commitBatch,
  linkDocs,
} from "./src/firestoreAdmin.js";

export {
  getId,
  getServerSequenceId,
  initAdminFirestoreDB,
  initBatch,
  setBatchItem,
  deleteDocs,
  commitBatch,
  linkDocs,
};