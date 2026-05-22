import { randomUUID } from 'node:crypto';
import { createClient, type RedisClientType } from 'redis';

/**
 * Session data persisted by LogtoClient. Matches the
 * {@link https://github.com/logto-io/js/blob/HEAD/packages/node/src/utils/session.ts | @logto/node SessionData} shape.
 */
type SessionData = Partial<Record<'idToken' | 'refreshToken' | 'accessToken' | 'signInSession', string>>;

/**
 * Wraps/unwraps session data for Logto's CookieStorage.
 * Matches the
 * {@link https://github.com/logto-io/js/blob/HEAD/packages/node/src/utils/cookie-storage.ts | @logto/node SessionWrapper} interface.
 */
interface SessionWrapper {
	wrap(data: SessionData, key: string): Promise<string>;
	unwrap(value: string, key: string): Promise<SessionData>;
}

const DEFAULT_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
const SESSION_PREFIX = 'session:';

/**
 * Redis-backed session wrapper.
 *
 * Stores session data in Redis with a UUID as the lookup key. The cookie
 * only holds the UUID (~36 bytes), same as MemorySessionWrapper, but sessions
 * survive server restarts and are shared across instances.
 *
 * Falls back to an in-memory Map if Redis is unreachable, so a Redis outage
 * doesn't crash existing sessions.
 */
export class RedisSessionWrapper implements SessionWrapper {
	private readonly client: RedisClientType | null;
	private readonly fallback = new Map<string, SessionData>();
	private connected = false;

	constructor(redisUrl?: string) {
		if (!redisUrl) {
			this.client = null;
			return;
		}

		this.client = createClient({ url: redisUrl });

		this.client.on('error', (err) => {
			console.warn('[RedisSession] Connection error, using in-memory fallback:', err.message);
			this.connected = false;
		});

		this.client.on('connect', () => {
			console.log('[RedisSession] Connected');
			this.connected = true;
		});

		// Connect asynchronously — don't block server startup.
		this.client.connect().catch((err) => {
			console.warn('[RedisSession] Failed to connect, using in-memory fallback:', err.message);
		});
	}

	async wrap(data: SessionData, _key: string): Promise<string> {
		const id = randomUUID();
		const json = JSON.stringify(data);

		if (this.client && this.connected) {
			try {
				await this.client.set(`${SESSION_PREFIX}${id}`, json, { EX: DEFAULT_TTL });
				return id;
			} catch (err) {
				console.warn('[RedisSession] Write failed, falling back to memory:', (err as Error).message);
			}
		}

		// In-memory fallback (Redis unreachable or write failed).
		this.fallback.set(id, { ...data });
		return id;
	}

	async unwrap(value: string, _key: string): Promise<SessionData> {
		if (!value) return {};

		if (this.client && this.connected) {
			try {
				const json = await this.client.get(`${SESSION_PREFIX}${value}`);
				if (json) return JSON.parse(json) as SessionData;
				// Key not found in Redis — session expired or never written there.
			} catch (err) {
				console.warn('[RedisSession] Read failed, trying fallback:', (err as Error).message);
			}
		}

		// Check in-memory fallback as last resort.
		return this.fallback.get(value) ?? {};
	}

	async disconnect(): Promise<void> {
		if (this.client) {
			await this.client.disconnect();
			console.log('[RedisSession] Disconnected');
		}
	}
}
