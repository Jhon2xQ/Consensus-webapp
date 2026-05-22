import { z } from "zod";
import { IFRAME_API_URL, BACKEND_API_URL } from "$env/static/private";
import { env as dynamicPrivate } from "$env/dynamic/private";

const privateEnvSchema = z.object({
  iframeApiUrl: z.url(),
  backendApiUrl: z.url(),
  logtoEndpoint: z.url(),
  logtoAppId: z.string().min(1),
  logtoAppSecret: z.string().min(1),
  logtoCookieEncryptionKey: z.string().min(32),
  logtoApiResource: z.url(),
  databaseUrl: z.url().optional(),
  redisUrl: z.string().optional(),
  resendApiKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
});

export const privateEnv = privateEnvSchema.parse({
  iframeApiUrl: IFRAME_API_URL,
  backendApiUrl: BACKEND_API_URL,
  logtoEndpoint: dynamicPrivate.LOGTO_ENDPOINT,
  logtoAppId: dynamicPrivate.LOGTO_APP_ID,
  logtoAppSecret: dynamicPrivate.LOGTO_APP_SECRET,
  logtoCookieEncryptionKey: dynamicPrivate.LOGTO_COOKIE_ENCRYPTION_KEY,
  logtoApiResource: dynamicPrivate.LOGTO_API_RESOURCE,
  databaseUrl: dynamicPrivate.DATABASE_URL,
  redisUrl: dynamicPrivate.REDIS_URL,
  resendApiKey: dynamicPrivate.RESEND_API_KEY,
  stripeSecretKey: dynamicPrivate.STRIPE_SECRET_KEY,
});

export type PrivateEnv = typeof privateEnv;
