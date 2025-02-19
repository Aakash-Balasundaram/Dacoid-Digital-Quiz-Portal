// dbConfig.js
import { initDB } from "react-indexed-db-hook";

const dbConfig = {
  name: "QuizDatabase",
  version: 1,
  objectStoresMeta: [
    {
      store: "quizAttempts",
      storeConfig: { keyPath: "id", autoIncrement: true },
      storeSchema: [{ name: "score", keypath: "score", options: { unique: false } }],
    },
  ],
};

// Initialize the database before using IndexedDB hooks
initDB(dbConfig)
  .then(() => console.log("IndexedDB Initialized"))
  .catch((error) => console.error("Error initializing IndexedDB", error));
