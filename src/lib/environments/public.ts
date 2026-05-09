import { z } from "zod";
import { PUBLIC_SITE_URL, PUBLIC_RELAYER_API_URL } from "$env/static/public";

const publicEnvSchema = z.object({
  siteUrl: z.url().optional(),
  relayerApiUrl: z.url(),
});

export const publicEnv = publicEnvSchema.parse({
  siteUrl: PUBLIC_SITE_URL,
  relayerApiUrl: PUBLIC_RELAYER_API_URL,
});

export type PublicEnv = typeof publicEnv;
