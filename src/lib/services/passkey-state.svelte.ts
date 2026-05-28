/**
 * Shared reactive state for passkey verification status.
 *
 * Module-level `$state` — shared across all components that import it.
 * Survives SPA navigation, resets on page reload (correct for ephemeral secrets).
 * Never persists to localStorage.
 */

type PasskeyStatus = 'none' | 'registered' | 'verified' | 'error';

// Module-level reactive state
let credentialId = $state<string | null>(null);
let status = $state<PasskeyStatus>('none');
let errorMessage = $state<string | null>(null);

// ── Actions (mutate state) ──

export function setCredentialId(id: string): void {
	credentialId = id;
}

export function setStatus(s: PasskeyStatus): void {
	status = s;
}

export function setError(msg: string): void {
	errorMessage = msg;
	status = 'error';
}

export function resetPasskeyState(): void {
	credentialId = null;
	status = 'none';
	errorMessage = null;
}

// ── Getters ──

export function getCredentialId(): string | null {
	return credentialId;
}

export function getPasskeyStatus(): PasskeyStatus {
	return status;
}

export function isPasskeyVerified(): boolean {
	return status === 'verified';
}
