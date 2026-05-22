import { privateEnv } from "$lib/environments/private";
import { handleLogto, UserScope } from "@logto/sveltekit";
import { RedisSessionWrapper } from "$lib/server/redis-session-wrapper";

const sessionWrapper = new RedisSessionWrapper(privateEnv.redisUrl);

// cookieConfig passes `sessionWrapper` to replace the default AES-GCM encryption
// with a Redis-backed store. The cookie only holds a UUID (~36 bytes).
// Falls back to in-memory if Redis is unreachable.
// TypeScript doesn't expose `sessionWrapper` on handleLogto's second param type
// yet, but it's accepted at runtime by CookieStorage.
export const handle = handleLogto(
  {
    endpoint: privateEnv.logtoEndpoint,
    appId: privateEnv.logtoAppId,
    appSecret: privateEnv.logtoAppSecret,
    resources: [privateEnv.logtoApiResource],
    scopes: [UserScope.Email, UserScope.Roles],
  },
  { sessionWrapper } as Record<string, unknown> as {
    encryptionKey: string;
  },
);
