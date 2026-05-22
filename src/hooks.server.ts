import { privateEnv } from "$lib/environments/private";
import { handleLogto, UserScope } from "@logto/sveltekit";
import { MemorySessionWrapper } from "$lib/server/session-wrapper";

const sessionWrapper = new MemorySessionWrapper();

// cookieConfig passes `sessionWrapper` to replace the default AES-GCM encryption
// with an in-memory store. The cookie only holds a UUID (~36 bytes).
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
