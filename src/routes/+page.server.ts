import type { Actions } from "./$types";

export const actions = {
  signIn: async ({ locals }) => {
    await locals.logtoClient.signIn("https://consensus.carmenio.com/callback/");
  },
  signOut: async ({ locals }) => {
    await locals.logtoClient.signOut("https://consensus.carmenio.com/");
  },
} satisfies Actions;
