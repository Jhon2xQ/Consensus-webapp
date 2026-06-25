import { z } from "zod";
import { IFRAME_API_URL, BACKEND_API_URL, LOGTO_SIGNIN_REDIRECT_URL, LOGTO_SIGNOUT_REDIRECT_URL } from "$env/static/private";
import { env as dynamicPrivate } from "$env/dynamic/private";

const privateEnvSchema = z.object({
  iframeApiUrl: z.url(),
  backendApiUrl: z.url(),
  logtoEndpoint: z.url().optional(),
  logtoAppId: z.string().min(1).optional(),
  logtoAppSecret: z.string().min(1).optional(),
  logtoCookieEncryptionKey: z.string().min(32).optional(),
  logtoApiResource: z.url().optional(),
  logtoSigninRedirectUrl: z.string().url(),
  logtoSignoutRedirectUrl: z.string().url(),
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
  logtoSigninRedirectUrl: LOGTO_SIGNIN_REDIRECT_URL,
  logtoSignoutRedirectUrl: LOGTO_SIGNOUT_REDIRECT_URL,
  databaseUrl: dynamicPrivate.DATABASE_URL,
  redisUrl: dynamicPrivate.REDIS_URL,
  resendApiKey: dynamicPrivate.RESEND_API_KEY,
  stripeSecretKey: dynamicPrivate.STRIPE_SECRET_KEY,
});

export type PrivateEnv = typeof privateEnv;
