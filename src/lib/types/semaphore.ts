import type { Identity } from '@semaphore-protocol/core';

export type SemaphoreIdentityResult = {
	identity: Identity;
	commitment: string;
};
