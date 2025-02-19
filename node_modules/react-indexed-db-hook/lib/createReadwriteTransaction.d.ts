export declare function createReadwriteTransaction(database: IDBDatabase, store: string, resolve: (e?: any) => void, reject: (e: Event) => void): {
    store: IDBObjectStore;
    transaction: IDBTransaction;
};
