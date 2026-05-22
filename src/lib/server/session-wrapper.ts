import { randomUUID } from 'node:crypto';

/**
 * Session data persisted by LogtoClient. Matches the {@link https://github.com/logto-io/js/blob/HEAD/packages/node/src/utils/session.ts | @logto/node SessionData} shape.
 */
type SessionData = Partial<Record<'idToken' | 'refreshToken' | 'accessToken' | 'signInSession', string>>;

/**
 * Wraps/unwraps session data for {@link https://github.com/logto-io/js/blob/HEAD/packages/node/src/utils/cookie-storage.ts | CookieStorage}.
 * Matches the {@link https://github.com/logto-io/js/blob/HEAD/packages/node/src/utils/cookie-storage.ts | @logto/node SessionWrapper} interface.
 */
interface SessionWrapper {
	wrap(data: SessionData, key: string): Promise<string>;
	unwrap(value: string, key: string): Promise<SessionData>;
}

/**
 * In-memory session wrapper.
 *
 * Instead of encrypting the entire session into a cookie, this stores
 * session data in a server-side Map and puts only a session UUID in the
 * cookie. That keeps the cookie tiny (~36 bytes) regardless of token size.
 *
 * Trade-off: sessions are lost on server restart. Migrate to Redis for
 * production persistence.
 */
export class MemorySessionWrapper implements SessionWrapper {
	private readonly store = new Map<string, SessionData>();

	async wrap(data: SessionData, _key: string): Promise<string> {
		const id = randomUUID();
		this.store.set(id, { ...data });
		return id;
	}

	async unwrap(value: string, _key: string): Promise<SessionData> {
		if (!value) return {};
		return this.store.get(value) ?? {};
	}
}
