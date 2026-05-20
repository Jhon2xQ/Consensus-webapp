import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DashboardHeader from './DashboardHeader.svelte';

// Mock page.data with a logged-in consensus-creator user
const mockPageCreator = vi.hoisted(() => ({
	data: {
		user: {
			name: 'Alice',
			username: 'alice',
			email: 'alice@example.com',
			picture: null,
			roles: ['consensus-creator']
		}
	}
}));

// Mock page.data with a logged-in user without the creator role
const mockPageStandard = vi.hoisted(() => ({
	data: {
		user: {
			name: 'Bob',
			username: 'bob',
			email: 'bob@example.com',
			picture: null,
			roles: ['voter']
		}
	}
}));

// Mock page.data with no user (logged out)
const mockPageLoggedOut = vi.hoisted(() => ({
	data: {}
}));

vi.mock('$app/state', () => ({
	page: mockPageCreator
}));

describe('DashboardHeader.svelte', () => {
	it('does not render the Consensus logo', async () => {
		render(DashboardHeader);
		await expect.element(page.getByText('Consensus')).not.toBeInTheDocument();
	});

	it('renders Home button for consensus-creator role', async () => {
		render(DashboardHeader);
		await expect.element(page.getByText('Home')).toBeInTheDocument();
	});
});
