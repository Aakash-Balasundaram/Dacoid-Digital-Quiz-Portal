import { createTransaction as defaultCreateTransaction, optionsGenerator as defaultOptionsBuilder } from "./Utils";
import { DBMode } from "./indexed-db";
export declare function createDatabaseTransaction(database: IDBDatabase, mode: DBMode, storeName: string, resolve: (e?: Event) => void, reject: (e: Event) => void, createTransaction?: typeof defaultCreateTransaction, buildOptions?: typeof defaultOptionsBuilder): {
    store: IDBObjectStore;
    transaction: IDBTransaction;
};
