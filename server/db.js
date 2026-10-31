import { JSONFilePreset } from 'lowdb/node';

let dbInstance = null;

const COLLECTION_MAP = {
    UserPreferences: 'preferences',
    DailyCheckIn: 'daily_checkins',
    PeriodLog: 'period_logs',
    SymptomLog: 'symptom_logs',
    Exercise: 'exercises',
    EmergencyContact: 'emergency_contacts',
    Task: 'tasks',
    ChatHistory: 'chat_history',
    users: 'users'
};

const DEFAULT_DATA = {
    users: [],
    preferences: [],
    daily_checkins: [],
    period_logs: [],
    symptom_logs: [],
    exercises: [],
    emergency_contacts: [],
    tasks: [],
    chat_history: []
};

// 1. Local File DB (development)
class LocalDB {
    constructor(filePath = 'db.json') {
        this.db = null;
        this.filePath = filePath;
    }

    async connect() {
        this.db = await JSONFilePreset(this.filePath, JSON.parse(JSON.stringify(DEFAULT_DATA)));
        await this.db.read();
    }

    async getData() {
        await this.db.read();
        return this.db.data;
    }

    async writeData(data) {
        this.db.data = data;
        await this.db.write();
    }
}

// 2. Upstash Redis DB (Production — via Vercel Marketplace or direct)
class UpstashRedisDB {
    constructor() {
        this.key = 'herverse_db';
        this.redis = null;
    }

    async connect() {
        try {
            // Support both Vercel KV env vars and Upstash env vars
            const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
            const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

            if (!url || !token) {
                throw new Error('No Redis URL/Token found in environment variables');
            }

            // Dynamic import to avoid crashes in dev
            const { Redis } = await import('@upstash/redis');
            this.redis = new Redis({ url, token });

            const data = await this.redis.get(this.key);
            if (!data) {
                await this.redis.set(this.key, JSON.stringify(DEFAULT_DATA));
            }
        } catch (error) {
            console.error("Upstash Redis Connection Error:", error);
            throw error;
        }
    }

    async getData() {
        const raw = await this.redis.get(this.key);
        if (!raw) return JSON.parse(JSON.stringify(DEFAULT_DATA));
        return typeof raw === 'string' ? JSON.parse(raw) : raw;
    }

    async writeData(data) {
        await this.redis.set(this.key, JSON.stringify(data));
    }
}

// 3. Vercel Blob (production when Redis isn't connected). The whole DB is one private JSON blob.
// Reads bypass the CDN cache (useCache: false) and writes use the ETag from that read (ifMatch),
// so a write based on stale data fails instead of silently overwriting someone else's save.
export class BlobDB {
    constructor({ token, client }) {
        this.token = token;
        this.client = client; // { get, put } from @vercel/blob (injectable for the self-check)
        this.pathname = 'herverse/db.json';
        this.etags = new WeakMap(); // data object -> ETag it was read with
    }

    async connect() {
        if (!this.client) this.client = await import('@vercel/blob');
        await this.getData(); // fail fast if the token or store is wrong (e.g. a public store)
    }

    async getData() {
        const result = await this.client.get(this.pathname, { access: 'private', useCache: false, token: this.token });
        const data = result ? JSON.parse(await new Response(result.stream).text()) : JSON.parse(JSON.stringify(DEFAULT_DATA));
        this.etags.set(data, result?.blob.etag ?? null);
        return data;
    }

    // Used by /api/health: proves the token can write (a public store or read-only token fails here).
    async checkWrite() {
        await this.client.put('herverse/health-check.txt', new Date().toISOString(), {
            access: 'private', token: this.token, contentType: 'text/plain', allowOverwrite: true, addRandomSuffix: false,
        });
    }

    async writeData(data) {
        const ifMatch = this.etags.get(data);
        try {
            await this.client.put(this.pathname, JSON.stringify(data), {
                access: 'private',
                token: this.token,
                contentType: 'application/json',
                addRandomSuffix: false,
                cacheControlMaxAge: 60,
                // First write: create only if still absent. Later writes: only if unchanged since our read.
                ...(ifMatch ? { allowOverwrite: true, ifMatch } : { allowOverwrite: false }),
            });
        } catch (e) {
            if (!ifMatch && /already exists/i.test(e.message)) throw Object.assign(e, { name: 'BlobPreconditionFailedError' });
            throw e;
        }
    }
}

// Retried when a Blob write lost a race (another request saved first): the method re-reads and re-applies.
const MUTATIONS = ['createUser', 'deleteUser', 'updateUser', 'createEntity', 'updateEntity', 'deleteEntity', 'appendChat'];
const isConflict = (e) => e?.name === 'BlobPreconditionFailedError' || e?.constructor?.name === 'BlobPreconditionFailedError';

// Unified Adapter using the strategy pattern for data access
// seniordev: whole DB is one document (one Redis key), read-modify-write on every change; two writes at the
// same instant can lose one, and Upstash caps request size. Move to per-user keys (or Postgres) as users grow.
export class DBAdapter {
    constructor(strategy) {
        this.strategy = strategy;
        for (const name of MUTATIONS) {
            const run = this[name].bind(this);
            this[name] = async (...args) => {
                for (let attempt = 1; ; attempt++) {
                    try {
                        return await run(...args);
                    } catch (e) {
                        if (!isConflict(e) || attempt >= 4) throw e;
                    }
                }
            };
        }
    }

    async _read() {
        return await this.strategy.getData();
    }

    async _write(data) {
        await this.strategy.writeData(data);
    }

    async findUser(criteria) {
        const data = await this._read();
        return data.users.find(u => {
            for (const key in criteria) {
                if (u[key] !== criteria[key]) return false;
            }
            return true;
        });
    }

    async findUserByEmailOrPhone(email, phone) {
        const data = await this._read();
        // Case/format-insensitive so accounts created before normalisation still match.
        return data.users.find(u =>
            (email && u.email?.toLowerCase() === email.toLowerCase()) ||
            (phone && u.phone?.replace(/[^\d+]/g, '') === phone.replace(/[^\d+]/g, ''))
        );
    }

    async createUser(user) {
        const data = await this._read();
        data.users.push(user);
        await this._write(data);
        return user;
    }

    async deleteUser(userId) {
        const data = await this._read();
        const userIndex = data.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            data.users.splice(userIndex, 1);
            // Cascade delete all user data
            for (const col of Object.values(COLLECTION_MAP)) {
                if (col === 'users') continue;
                if (data[col]) {
                    data[col] = data[col].filter(item => item.user_id !== userId);
                }
            }
            await this._write(data);
            return true;
        }
        return false;
    }

    async updateUser(userId, updates) {
        const data = await this._read();
        const index = data.users.findIndex(u => u.id === userId);
        if (index === -1) return null;
        // Don't allow updating password or id through this method
        const { password, id, ...safeUpdates } = updates;
        data.users[index] = { ...data.users[index], ...safeUpdates };
        await this._write(data);
        const { password: _, ...userWithoutPassword } = data.users[index];
        return userWithoutPassword;
    }

    async findEntities(collectionName, query = {}, options = {}) {
        const data = await this._read();
        let results = data[collectionName] || [];

        // Filter
        results = results.filter(item => {
            for (const key in query) {
                if (item[key] !== query[key]) return false;
            }
            return true;
        });

        // Sort
        if (options.sort) {
            const key = options.sort.replace('-', '');
            const dir = options.sort.startsWith('-') ? -1 : 1;
            results.sort((a, b) => (a[key] > b[key] ? 1 : -1) * dir);
        }

        // Limit
        if (options.limit) {
            results = results.slice(0, parseInt(options.limit));
        }

        return results;
    }

    async createEntity(collectionName, item) {
        const data = await this._read();
        if (!data[collectionName]) data[collectionName] = [];
        data[collectionName].push(item);
        await this._write(data);
        return item;
    }

    async updateEntity(collectionName, id, userId, updates) {
        const data = await this._read();
        const collection = data[collectionName] || [];
        const index = collection.findIndex(item => item.id === id && item.user_id === userId);

        if (index === -1) return null;

        const updated = { ...collection[index], ...updates };
        collection[index] = updated;
        await this._write(data);
        return updated;
    }

    // Appends chat turns and keeps only the newest `keep` messages for this user (keep = 0 clears).
    async appendChat(userId, items, keep) {
        const data = await this._read();
        const mine = [...(data.chat_history || []).filter(m => m.user_id === userId), ...items]
            .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)))
            .slice(-keep || Infinity);
        data.chat_history = [...(data.chat_history || []).filter(m => m.user_id !== userId), ...(keep ? mine : [])];
        await this._write(data);
    }

    async deleteEntity(collectionName, id, userId) {
        const data = await this._read();
        const collection = data[collectionName] || [];
        const index = collection.findIndex(item => item.id === id && item.user_id === userId);

        if (index === -1) {
            // Check if exists but different user
            const exists = collection.find(item => item.id === id);
            if (exists) throw new Error('Unauthorized');
            return false;
        }

        collection.splice(index, 1);
        await this._write(data);
        return true;
    }
}

// Vercel names Blob tokens <PREFIX>_READ_WRITE_TOKEN (default prefix BLOB); values start with vercel_blob_rw_.
const blobToken = () => process.env.BLOB_READ_WRITE_TOKEN ||
    Object.entries(process.env).find(([k, v]) => k.endsWith('_READ_WRITE_TOKEN') && v?.startsWith('vercel_blob_rw_'))?.[1];

const hasRedisEnv = () => !!(
    (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
    (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
);

// Vercel functions have no persistent disk, so production must use Redis. If Redis is missing or
// unreachable we throw (and retry on the next request) instead of pretending to save.
export const getDB = async () => {
    if (dbInstance) return dbInstance;

    if (process.env.VERCEL) {
        let strategy;
        if (hasRedisEnv()) {
            strategy = new UpstashRedisDB();
        } else if (blobToken()) {
            strategy = new BlobDB({ token: blobToken() });
        } else {
            throw new Error('No database configured: connect Upstash Redis or a private Vercel Blob store to this project.');
        }
        await strategy.connect();
        dbInstance = new DBAdapter(strategy);
        dbInstance.storage = strategy instanceof BlobDB ? 'vercel-blob' : 'upstash-redis';
    } else {
        const strategy = new LocalDB('db.json');
        await strategy.connect();
        dbInstance = new DBAdapter(strategy);
        dbInstance.storage = 'local-file';
    }
    console.log(`Database: ${dbInstance.storage}`);
    return dbInstance;
};

export { COLLECTION_MAP };
