import { page } from 'vitest/browser';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Layout from './+layout.svelte';

// Mock page for isProcessDetail derived (Phase 4 of process-detail-layout-split).
// Each test sets the pathname via `mockPage.url`. The Header component reads
// `page.data.user`, so `data` must be present (and safe to access as `undefined`
// — Header tolerates a missing user).
const mockPage = vi.hoisted(() => ({
	url: new URL('http://localhost/'),
	data: {} as { user?: unknown }
}));

vi.mock('$app/state', () => ({
	page: mockPage
}));

function setPathname(pathname: string) {
	// Mutate the existing URL so the mock object identity stays stable.
	mockPage.url.pathname = pathname;
}

describe('+layout.svelte', () => {
	beforeEach(() => {
		setPathname('/');
	});

	it('renders header and footer on /', async () => {
		render(Layout);
		await expect.element(page.getByRole('banner')).toBeInTheDocument();
		await expect.element(page.getByRole('contentinfo')).toBeInTheDocument();
	});

	it('renders the Consensus brand in header', async () => {
		render(Layout);
		await expect.element(page.getByRole('banner').getByRole('link', { name: 'Consensus' })).toBeInTheDocument();
	});

	// Phase 4: footer suppression on /procesos/[id] (process-detail-layout-split).
	describe('isProcessDetail footer suppression', () => {
		it('hides the footer on /procesos/abc but keeps the header', async () => {
			// RED: assert that the footer is NOT rendered when the pathname
			// starts with `/procesos/`, and the header IS still rendered.
			setPathname('/procesos/abc');
			render(Layout);
			await expect.element(page.getByRole('banner')).toBeInTheDocument();
			await expect.element(page.getByRole('contentinfo')).not.toBeInTheDocument();
		});

		it('still renders the footer on the /procesos list route', async () => {
			// RED: assert that the trailing slash is required — the bare
			// `/procesos` list route should keep the footer.
			setPathname('/procesos');
			render(Layout);
			await expect.element(page.getByRole('banner')).toBeInTheDocument();
			await expect.element(page.getByRole('contentinfo')).toBeInTheDocument();
		});

		it('hides the footer on a deep /procesos/[id]/sub route', async () => {
			// RED: assert that any future sub-route under /procesos/ also
			// suppresses the footer (forward-compatible behavior).
			setPathname('/procesos/abc/results');
			render(Layout);
			await expect.element(page.getByRole('banner')).toBeInTheDocument();
			await expect.element(page.getByRole('contentinfo')).not.toBeInTheDocument();
		});
	});
});
