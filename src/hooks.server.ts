import { privateEnv } from "$lib/environments/private";
import { handleLogto } from "@logto/sveltekit";

export const handle = handleLogto(
  {
    endpoint: privateEnv.logtoEndpoint,
    appId: privateEnv.logtoAppId,
    appSecret: privateEnv.logtoAppSecret,
    resources: [privateEnv.logtoApiResource],
  },
  {
    encryptionKey: privateEnv.logtoCookieEncryptionKey,
  },
);
