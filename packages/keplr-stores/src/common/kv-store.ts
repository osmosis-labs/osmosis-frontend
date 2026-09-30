// Adapted from @keplr-wallet/common@0.10.24 (Apache-2.0).

export interface KVStore {
  get<T = unknown>(key: string): Promise<T | undefined>;
  set<T = unknown>(key: string, data: T | null): Promise<void>;
  prefix(): string;
}

/** In-memory store; used in tests and on the server where there is no browser storage. */
export class MemoryKVStore implements KVStore {
  protected store: Record<string, unknown> = {};

  constructor(protected readonly _prefix: string) {}

  get<T = unknown>(key: string): Promise<T | undefined> {
    return Promise.resolve(this.store[this.key(key)] as T | undefined);
  }

  set<T = unknown>(key: string, data: T | null): Promise<void> {
    this.store = { ...this.store, [this.key(key)]: data };
    return Promise.resolve();
  }

  prefix(): string {
    return this._prefix;
  }

  private key(key: string): string {
    return this.prefix() + "/" + key;
  }
}

export class LocalKVStore implements KVStore {
  constructor(protected readonly _prefix: string) {}

  get<T = unknown>(key: string): Promise<T | undefined> {
    const data = localStorage.getItem(this.key(key));
    if (data === null) {
      return Promise.resolve(undefined);
    }
    return Promise.resolve(JSON.parse(data));
  }

  set<T = unknown>(key: string, data: T | null): Promise<void> {
    if (data === null) {
      return Promise.resolve(localStorage.removeItem(this.key(key)));
    }
    return Promise.resolve(
      localStorage.setItem(this.key(key), JSON.stringify(data))
    );
  }

  prefix(): string {
    return this._prefix;
  }

  private key(key: string): string {
    return this.prefix() + "/" + key;
  }
}

/** Uses one IndexedDB database per prefix, holding a single object store of the same name. */
export class IndexedDBKVStore implements KVStore {
  protected cachedDB?: IDBDatabase;

  constructor(protected readonly _prefix: string) {}

  async get<T = unknown>(key: string): Promise<T | undefined> {
    const store = (await this.getDB())
      .transaction([this.prefix()], "readonly")
      .objectStore(this.prefix());

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = (event) => {
        event.stopPropagation();
        reject(event.target);
      };
      request.onsuccess = () => {
        resolve(request.result ? request.result.data : undefined);
      };
    });
  }

  async set<T = unknown>(key: string, data: T | null): Promise<void> {
    const store = (await this.getDB())
      .transaction([this.prefix()], "readwrite")
      .objectStore(this.prefix());

    return new Promise((resolve, reject) => {
      const request =
        data === null ? store.delete(key) : store.put({ key, data });
      request.onerror = (event) => {
        event.stopPropagation();
        reject(event.target);
      };
      request.onsuccess = () => {
        resolve();
      };
    });
  }

  prefix(): string {
    return this._prefix;
  }

  protected async getDB(): Promise<IDBDatabase> {
    if (this.cachedDB) {
      return this.cachedDB;
    }

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.prefix());
      request.onerror = (event) => {
        event.stopPropagation();
        reject(event.target);
      };
      request.onupgradeneeded = () => {
        request.result.createObjectStore(this.prefix(), { keyPath: "key" });
      };
      request.onsuccess = () => {
        this.cachedDB = request.result;
        resolve(request.result);
      };
    });
  }
}
