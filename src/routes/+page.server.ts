import { privateEnv } from "$lib/environments/private";
import type { Actions } from "./$types";

export const actions = {
  signIn: async ({ locals }) => {
    await locals.logtoClient.signIn(privateEnv.logtoSigninRedirectUrl);
  },
  signOut: async ({ locals }) => {
    await locals.logtoClient.signOut(privateEnv.logtoSignoutRedirectUrl);
  },
} satisfies Actions;
