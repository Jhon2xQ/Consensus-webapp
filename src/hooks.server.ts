import { privateEnv } from "$lib/environments/private";
import { handleLogto, UserScope } from "@logto/sveltekit";

export const handle = handleLogto(
  {
    endpoint: privateEnv.logtoEndpoint,
    appId: privateEnv.logtoAppId,
    appSecret: privateEnv.logtoAppSecret,
    resources: [privateEnv.logtoApiResource],
    scopes: [UserScope.Email, UserScope.Roles],
  },
  {
    encryptionKey: privateEnv.logtoCookieEncryptionKey,
  },
);
