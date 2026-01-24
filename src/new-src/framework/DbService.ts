import PieceEnum from "../models/BoardModel.type.js";

class DBService {

    static NAME = 'game';

    static VERSION = 1;

    public async createDb(): Promise<void> {
        const dbPromise: Promise<IDBDatabase> = new Promise((resolve, reject) => {
            const request = indexedDB.open(DBService.NAME, DBService.VERSION);

            request.onerror = (ev) => {
                console.error('❗ Db error:', ev);
                reject(new Error('Failed to open IndexedDB: onerror'));
            };

            request.onsuccess = () => {
                console.log('✨ Db connected.');
                resolve(request.result);
            };

            request.onblocked = (ev) => {
                console.error('❗ Db blocked:', ev);
                reject(new Error(`Failed to open IndexedDB: onblocked.`));
            }

            request.onupgradeneeded = (event) => {

                const db = (event.target as IDBOpenDBRequest).result;

                if (!db.objectStoreNames.contains(PieceEnum.Fields)) {
                    db.createObjectStore(PieceEnum.Fields);
                }
                if (!db.objectStoreNames.contains(PieceEnum.Trains)) {
                    db.createObjectStore(PieceEnum.Trains);
                }
                if (!db.objectStoreNames.contains(PieceEnum.Buildings)) {
                    db.createObjectStore(PieceEnum.Buildings);
                }
                if (!db.objectStoreNames.contains(PieceEnum.Events)) {
                    db.createObjectStore(PieceEnum.Events);
                }
                if (!db.objectStoreNames.contains(PieceEnum.Tracks)) {
                    db.createObjectStore(PieceEnum.Tracks);
                }
            };
        });
        this._db = dbPromise;
    }

    private _db!: Promise<IDBDatabase>;

    get db() {
        return this._db;
    }

    private static _instance: DBService;

    private constructor() {
        DBService._instance = this;
        this.drop = this.drop.bind(this);
        this.createDb = this.createDb.bind(this);
    }

    public async drop() {
        await new Promise(async (res) => {
            (await this._db).close();
            const totallyArbitraryTimeoutIDontEventKnowIfNecessary = 100;
            setTimeout(res, totallyArbitraryTimeoutIDontEventKnowIfNecessary);
        });
        await new Promise((res, rej) => {
            const dropRequest = indexedDB.deleteDatabase(DBService.NAME);
            dropRequest.onsuccess = (e) => {
                res(`✨DBService drop: ${e.type}`)
            }
            dropRequest.onerror = (e) => {
                rej(`❗DBService drop: ${e.type}`)
            }
            dropRequest.onblocked = (e) => {
                rej(`❗DBService drop: ${e.type}`)
            }
            dropRequest.onupgradeneeded = (e) => {
                rej(`❗DBService drop: ${e.type}`)
            }
        });
    }

    static I() {
        if (!DBService._instance) {
            DBService._instance = new DBService();
        }
        return DBService._instance;
    }

    public async get<T>(storeName: PieceEnum, key: string): Promise<T | null> {
        return new Promise(async (res, rej) => {
            const request = (await this.db)
                .transaction([storeName], 'readonly')
                .objectStore(storeName)
                .get(key);

            request.onsuccess = () => {
                res(request.result);
            };

            request.onerror = () => {
                rej(new Error(`Failed to get ${key} from ${storeName}`));
            };
        });
    }

    public async set(storeName: PieceEnum, value: object & { _id: string }): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const request = (await this.db)
                .transaction([storeName], 'readwrite')
                .objectStore(storeName)
                .put(value, value._id);

            request.onsuccess = (e) => {
                resolve();
            };

            request.onerror = (e) => {
                reject(new Error(`Failed to set ${value._id} in ${storeName}. Event: ${e}`));
            };
        });
    }

    public async getAll(storeName: PieceEnum): Promise<Record<string, any>> {
        return new Promise(async (resolve, reject) => {
            const request = (await this.db)
                .transaction([storeName], 'readonly')
                .objectStore(storeName)
                .openCursor();

            const result: Record<string, any> = {};

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue | null>).result;
                if (cursor) {
                    result[cursor.key as string] = cursor.value;
                    cursor.continue();
                } else {
                    resolve(result);
                }
            };

            request.onerror = () => {
                reject(new Error(`Failed to get all from ${storeName}`));
            };
        });
    }

    public async delete(storeName: PieceEnum, key: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const request = (await this.db)
                .transaction([storeName], 'readwrite')
                .objectStore(storeName)
                .delete(key);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error(`Failed to delete ${key} from ${storeName}`));
            };
        });
    }

    public async clear(storeName: PieceEnum): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const request = (await this.db)
                .transaction([storeName], 'readwrite')
                .objectStore(storeName)
                .clear();

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error(`Failed to clear ${storeName}`));
            };
        });
    }

    static async exists(): Promise<boolean> {
        return new Promise((resolve) => {
            const request = indexedDB.open(DBService.NAME);

            request.onsuccess = () => {
                request.result.close();
                resolve(true);
            };

            request.onerror = () => {
                resolve(false);
            };

            request.onupgradeneeded = () => {
                (request.transaction as IDBTransaction)?.abort();
                request.result.close();
                resolve(false);
            };
        });
    }
}

export default DBService;



