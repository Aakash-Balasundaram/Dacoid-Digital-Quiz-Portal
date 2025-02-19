export declare function createReadonlyTransaction(database: IDBDatabase, store: string, resolve: (payload?: any) => void, reject: (e: Event) => void): {
    store: IDBObjectStore;
    transaction: IDBTransaction;
};
