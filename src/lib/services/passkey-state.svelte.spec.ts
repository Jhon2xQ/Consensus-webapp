import { describe, it, expect, beforeEach } from 'vitest';
import {
	setCredentialId,
	setStatus,
	setError,
	resetPasskeyState,
	getCredentialId,
	getPasskeyStatus,
	isPasskeyVerified
} from './passkey-state.svelte';

describe('passkey-state', () => {
	beforeEach(() => {
		resetPasskeyState();
	});

	it('initial state: credentialId is null', () => {
		expect(getCredentialId()).toBeNull();
	});

	it('initial state: status is none', () => {
		expect(getPasskeyStatus()).toBe('none');
	});

	it('initial state: isPasskeyVerified is false', () => {
		expect(isPasskeyVerified()).toBe(false);
	});

	it('setCredentialId stores the credential id', () => {
		setCredentialId('cred-abc-123');
		expect(getCredentialId()).toBe('cred-abc-123');
	});

	it('setCredentialId overwrites previous value', () => {
		setCredentialId('cred-first');
		setCredentialId('cred-second');
		expect(getCredentialId()).toBe('cred-second');
	});

	it('setStatus updates the passkey status', () => {
		setStatus('registered');
		expect(getPasskeyStatus()).toBe('registered');
	});

	it('setStatus transitions through all valid states', () => {
		setStatus('registered');
		expect(getPasskeyStatus()).toBe('registered');

		setStatus('verified');
		expect(getPasskeyStatus()).toBe('verified');
		expect(isPasskeyVerified()).toBe(true);

		setStatus('error');
		expect(getPasskeyStatus()).toBe('error');
	});

	it('resetPasskeyState clears all state back to defaults', () => {
		setCredentialId('cred-abc');
		setStatus('verified');
		setError('some error');

		resetPasskeyState();

		expect(getCredentialId()).toBeNull();
		expect(getPasskeyStatus()).toBe('none');
		expect(isPasskeyVerified()).toBe(false);
	});

	it('isPasskeyVerified returns true only when status is verified', () => {
		setStatus('none');
		expect(isPasskeyVerified()).toBe(false);

		setStatus('registered');
		expect(isPasskeyVerified()).toBe(false);

		setStatus('verified');
		expect(isPasskeyVerified()).toBe(true);

		setStatus('error');
		expect(isPasskeyVerified()).toBe(false);
	});

	it('does not persist to localStorage', () => {
		setCredentialId('cred-xyz');
		setStatus('verified');

		const stored = localStorage.getItem('passkey-credential-id');
		expect(stored).toBeNull();

		const storedStatus = localStorage.getItem('passkey-status');
		expect(storedStatus).toBeNull();
	});

	it('state survives across getter calls (module-level persistence)', () => {
		setCredentialId('cred-123');
		setStatus('registered');

		// Multiple getter calls return the same state
		expect(getCredentialId()).toBe('cred-123');
		expect(getCredentialId()).toBe('cred-123');
		expect(getPasskeyStatus()).toBe('registered');
		expect(getPasskeyStatus()).toBe('registered');
	});
});
