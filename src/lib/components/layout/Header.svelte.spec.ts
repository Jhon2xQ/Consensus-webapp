import { page } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Header from './Header.svelte';

const mockPage = vi.hoisted(() => ({
	data: { user: null as Record<string, unknown> | null },
}));

vi.mock('$app/state', () => ({
	page: mockPage,
}));

// Mock passkey services
const mockSupportsPasskeys = vi.hoisted(() => vi.fn(() => true));
const mockRegisterPasskey = vi.hoisted(() => vi.fn());

vi.mock('$lib/services/passkey.service', () => ({
	supportsPasskeys: mockSupportsPasskeys,
	registerPasskey: mockRegisterPasskey
}));

// Mock $app/navigation for afterNavigate
const mockAfterNavigate = vi.hoisted(() => vi.fn());
vi.mock('$app/navigation', () => ({
	afterNavigate: mockAfterNavigate
}));

describe('Header.svelte', () => {
	// Restore navigator.userAgent after each test (Firefox mocking)
	let originalUserAgent: PropertyDescriptor | undefined;
	beforeEach(() => {
		originalUserAgent = Object.getOwnPropertyDescriptor(globalThis.navigator, 'userAgent');
	});
	afterEach(() => {
		if (originalUserAgent) {
			Object.defineProperty(globalThis.navigator, 'userAgent', originalUserAgent);
		}
		mockSupportsPasskeys.mockReturnValue(true);
		mockRegisterPasskey.mockReset();
	});

	function stubUserAgent(value: string) {
		Object.defineProperty(globalThis.navigator, 'userAgent', {
			value,
			configurable: true,
			writable: true
		});
	}

	// =========================================================================
	// Brand & navigation (FR-H-4, FR-H-6)
	// =========================================================================

	it('renders the brand name as a link to home', async () => {
		render(Header);
		const homeLink = page.getByRole('link', { name: 'Consensus' });
		await expect.element(homeLink).toBeInTheDocument();
		await expect.element(homeLink).toHaveAttribute('href', '/');
	});

	it('renders a 32×32 red brand mark with a white C', async () => {
		render(Header);
		const brand = page.getByRole('link', { name: 'Consensus' });
		await expect.element(brand).toBeInTheDocument();
		// The brand mark is the <div> directly inside the brand link
		// (it contains only the letter "C"). It must be 32×32 with the brand-red bg.
		const mark = page.getByText('C', { exact: true });
		const el = mark.element();
		expect(el).toBeTruthy();
		expect(el.tagName.toLowerCase()).toBe('div');
		expect(el.className).toMatch(/\bw-8\b/);
		expect(el.className).toMatch(/\bh-8\b/);
		expect(el.className).toMatch(/\bbg-brand-red\b/);
	});

	it('renders the Procesos navigation link', async () => {
		render(Header);
		const procesosLink = page.getByRole('link', { name: 'Procesos' });
		await expect.element(procesosLink).toBeInTheDocument();
		await expect.element(procesosLink).toHaveAttribute('href', '/procesos');
	});

	it('has a navigation landmark', async () => {
		render(Header);
		await expect
			.element(page.getByRole('navigation', { name: 'Navegación principal' }))
			.toBeInTheDocument();
	});

	it('is sticky at the top with z-50 and a translucent background', async () => {
		render(Header);
		// There is exactly one <header> at the top of the layout — use getByText
		// on the brand name to find its enclosing landmark via traversal is not
		// possible, so we look for the first <header> in the document body.
		const headerEl = page.getByText('Consensus', { exact: true })
			.element()
			.closest('header');
		expect(headerEl).toBeTruthy();
		const cls = (headerEl as HTMLElement).className;
		expect(cls).toMatch(/\bsticky\b/);
		expect(cls).toMatch(/\btop-0\b/);
		expect(cls).toMatch(/\bz-50\b/);
		expect(cls).toMatch(/\bbackdrop-blur/);
	});

	// =========================================================================
	// Unauthenticated state (S-2)
	// =========================================================================

	describe('unauthenticated state', () => {
		beforeEach(() => {
			mockPage.data.user = null;
		});

		it('renders the Iniciar Sesión button inside a signIn form', async () => {
			render(Header);
			const form = page.getByRole('form', { name: 'Iniciar sesión' });
			await expect.element(form).toBeInTheDocument();
			await expect.element(form).toHaveAttribute('method', 'POST');
			await expect.element(form).toHaveAttribute('action', '/?/signIn');
			await expect
				.element(page.getByRole('button', { name: 'Iniciar Sesión' }))
				.toBeInTheDocument();
		});

		it('does not render a Dashboard link when no user is signed in', async () => {
			render(Header);
			await expect.element(page.getByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
		});

		it('does not render an avatar or dropdown trigger when no user is signed in', async () => {
			render(Header);
			// No img with alt containing "Avatar" and no user menu button.
			await expect.element(page.getByRole('img', { name: /Avatar de/ })).not.toBeInTheDocument();
		});
	});

	// =========================================================================
	// Authenticated state — header + dropdown (FR-H-1, FR-H-2, S-3)
	// =========================================================================

	describe('authenticated state', () => {
		beforeEach(() => {
			mockPage.data.user = {
				sub: 'test-user-123',
				name: 'María García',
				username: 'maria_g',
				email: '[email protected]',
				picture: 'https://example.com/avatar.jpg',
			};
		});

		it('renders the user name in the trigger', async () => {
			render(Header);
			await expect.element(page.getByText('María García')).toBeInTheDocument();
		});

		it('renders the user avatar when picture is available', async () => {
			render(Header);
			const img = page.getByRole('img', { name: 'Avatar de María García' });
			await expect.element(img).toBeInTheDocument();
			await expect.element(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
		});

		it('falls back to username when name is not provided and picture is absent', async () => {
			mockPage.data.user = {
				sub: 'user-no-name',
				username: 'anon_user',
			};
			render(Header);
			await expect.element(page.getByText('anon_user')).toBeInTheDocument();
			await expect.element(page.getByRole('img')).not.toBeInTheDocument();
		});

		it('shows fallback text when neither name nor username is provided', async () => {
			mockPage.data.user = {
				sub: 'minimal-user',
			};
			render(Header);
			await expect.element(page.getByText('Usuario')).toBeInTheDocument();
			await expect.element(page.getByRole('img')).not.toBeInTheDocument();
		});

		describe('dropdown', () => {
			async function openDropdown() {
				const trigger = page.getByRole('button', { name: 'María García' });
				await trigger.click();
			}

			it('shows the real user email in the dropdown header', async () => {
				render(Header);
				await openDropdown();
				await expect.element(page.getByText('[email protected]')).toBeInTheDocument();
			});

			it('renders EXACTLY two action buttons: Registrar Credencial and Cerrar Sesión', async () => {
				render(Header);
				await openDropdown();
				// Both action buttons live inside the menu, so their accessible role
				// is "menuitem" (explicitly set via role="menuitem" for the Registrar
				// button and inherited from the shadcn Button inside the form for
				// Cerrar Sesión). We assert the menuitem role to be unambiguous.
				await expect
					.element(page.getByRole('menuitem', { name: 'Registrar Credencial' }))
					.toBeInTheDocument();
				await expect
					.element(page.getByRole('menuitem', { name: 'Cerrar Sesión' }))
					.toBeInTheDocument();
			});

			it('does NOT render any "Registrada" status text inside the dropdown', async () => {
				render(Header);
				await openDropdown();
				// FR-H-2: the old "Registrada" status text MUST be removed.
				await expect
					.element(page.getByText(/Registrada/))
					.not.toBeInTheDocument();
			});

			it('does NOT render the legacy "Dispositivo" or "Navegador no compatible" labels', async () => {
				render(Header);
				await openDropdown();
				await expect.element(page.getByText('Dispositivo')).not.toBeInTheDocument();
				await expect
					.element(page.getByText('Navegador no compatible'))
					.not.toBeInTheDocument();
			});

			it('renders the Cerrar Sesión form pointing at /?/signOut with method POST', async () => {
				render(Header);
				await openDropdown();
				const form = page.getByRole('form', { name: 'Cerrar sesión' });
				await expect.element(form).toBeInTheDocument();
				await expect.element(form).toHaveAttribute('method', 'POST');
				await expect.element(form).toHaveAttribute('action', '/?/signOut');
			});

			it('invokes registerPasskey(user.sub, user.name) when Registrar Credencial is clicked', async () => {
				mockSupportsPasskeys.mockReturnValue(true);
				render(Header);
				await openDropdown();
				await page.getByRole('menuitem', { name: 'Registrar Credencial' }).click();
				expect(mockRegisterPasskey).toHaveBeenCalledWith('test-user-123', 'María García');
			});

			// =====================================================================
			// Firefox passkey warning (FR-H-3) — conditional on UA only
			// =====================================================================

			describe('Firefox passkey warning', () => {
				const FIREFOX_WARNING =
					'Firefox no soporta QR cross-device. Usá Chrome o Safari.';

				it('renders the warning when navigator.userAgent includes "Firefox"', async () => {
					stubUserAgent('Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0');
					render(Header);
					await openDropdown();
					await expect.element(page.getByText(FIREFOX_WARNING)).toBeInTheDocument();
				});

				it('does NOT render the warning when the browser is Chrome', async () => {
					stubUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36');
					render(Header);
					await openDropdown();
					await expect.element(page.getByText(FIREFOX_WARNING)).not.toBeInTheDocument();
				});

				it('does NOT render the warning on Safari', async () => {
					stubUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15');
					render(Header);
					await openDropdown();
					await expect.element(page.getByText(FIREFOX_WARNING)).not.toBeInTheDocument();
				});
			});
		});
	});

	// =========================================================================
	// Dashboard link — only for consensus-creator role (FR-H-5)
	// =========================================================================

	describe('Dashboard link', () => {
		it('does NOT render the Dashboard link for an authenticated user without the role', async () => {
			mockPage.data.user = {
				sub: 'plain-user',
				name: 'Plain User',
				email: '[email protected]',
			};
			render(Header);
			await expect.element(page.getByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
		});

		it('renders the Dashboard link for a user with the consensus-creator role', async () => {
			mockPage.data.user = {
				sub: 'creator-1',
				name: 'Creator User',
				email: '[email protected]',
				roles: ['consensus-creator'],
			};
			render(Header);
			const link = page.getByRole('link', { name: 'Dashboard' });
			await expect.element(link).toBeInTheDocument();
			await expect.element(link).toHaveAttribute('href', '/dashboard');
		});
	});

	// =========================================================================
	// Mobile sheet (responsive refactor)
	// =========================================================================

	describe('mobile sheet', () => {
		it('renders a hamburger button with accessible label', async () => {
			mockPage.data.user = null;
			render(Header);
			const hamburger = page.getByRole('button', { name: 'Abrir menú de navegación' });
			await expect.element(hamburger).toBeInTheDocument();
		});

		describe('guest Sheet content', () => {
			beforeEach(() => {
				mockPage.data.user = null;
			});

			it('opens a dialog when hamburger is tapped', async () => {
				render(Header);
				await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
				await expect.element(page.getByRole('dialog')).toBeInTheDocument();
			});

			it('shows Iniciar Sesión button in the Sheet', async () => {
				render(Header);
				await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
				const signInBtn = page.getByRole('dialog').getByRole('button', { name: 'Iniciar Sesión' });
				await expect.element(signInBtn).toBeInTheDocument();
			});

			it('shows Procesos link in the Sheet navigation', async () => {
				render(Header);
				await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
				const procesosLink = page.getByRole('dialog').getByRole('link', { name: 'Procesos' });
				await expect.element(procesosLink).toBeInTheDocument();
				await expect.element(procesosLink).toHaveAttribute('href', '/procesos');
			});

			it('renders a separator between auth and navigation sections', async () => {
				render(Header);
				await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
				await expect.element(page.getByRole('dialog').getByRole('separator')).toBeInTheDocument();
			});

			it('does NOT show Dashboard link in the Sheet for guests', async () => {
				render(Header);
				await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
				await expect.element(
					page.getByRole('dialog').getByRole('link', { name: 'Dashboard' })
				).not.toBeInTheDocument();
			});
		});

		describe('authenticated Sheet content', () => {
			beforeEach(() => {
				mockPage.data.user = {
					sub: 'test-user-123',
					name: 'María García',
					email: '[email protected]',
					picture: 'https://example.com/avatar.jpg',
				};
			});

			it('shows user avatar and name in the Sheet', async () => {
				render(Header);
				await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
				const dialog = page.getByRole('dialog');
				await expect.element(dialog.getByText('María García')).toBeInTheDocument();
				await expect.element(dialog.getByRole('img', { name: 'Avatar de María García' })).toBeInTheDocument();
			});

			it('shows user email in the Sheet', async () => {
				render(Header);
				await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
				await expect.element(
					page.getByRole('dialog').getByText('[email protected]')
				).toBeInTheDocument();
			});

			it('shows Registrar Credencial and Cerrar Sesión in the Sheet', async () => {
				render(Header);
				await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
				const dialog = page.getByRole('dialog');
				await expect.element(dialog.getByRole('button', { name: 'Registrar Credencial' })).toBeInTheDocument();
				await expect.element(dialog.getByRole('button', { name: 'Cerrar Sesión' })).toBeInTheDocument();
			});

			it('invokes registerPasskey when Registrar Credencial is tapped in Sheet', async () => {
				mockSupportsPasskeys.mockReturnValue(true);
				render(Header);
				await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
				await page.getByRole('dialog').getByRole('button', { name: 'Registrar Credencial' }).click();
				expect(mockRegisterPasskey).toHaveBeenCalledWith('test-user-123', 'María García');
			});

			it('shows Firefox warning in Sheet when UA matches Firefox', async () => {
				stubUserAgent('Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120.0');
				render(Header);
				await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
				await expect.element(
					page.getByRole('dialog').getByText('Firefox no soporta QR cross-device. Usá Chrome o Safari.')
				).toBeInTheDocument();
			});
		});

		describe('creator Dashboard link in Sheet', () => {
			it('shows Dashboard link for consensus-creator role', async () => {
				mockPage.data.user = {
					sub: 'creator-1',
					name: 'Creator User',
					email: '[email protected]',
					roles: ['consensus-creator'],
				};
				render(Header);
				await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
				const dashboardLink = page.getByRole('dialog').getByRole('link', { name: 'Dashboard' });
				await expect.element(dashboardLink).toBeInTheDocument();
				await expect.element(dashboardLink).toHaveAttribute('href', '/dashboard');
			});

			it('does NOT show Dashboard link for user without consensus-creator role', async () => {
				mockPage.data.user = {
					sub: 'plain-user',
					name: 'Plain User',
					email: '[email protected]',
				};
				render(Header);
				await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
				await expect.element(
					page.getByRole('dialog').getByRole('link', { name: 'Dashboard' })
				).not.toBeInTheDocument();
			});
		});

		describe('afterNavigate closes Sheet', () => {
			it('registers an afterNavigate callback on mount', async () => {
				mockPage.data.user = null;
				mockAfterNavigate.mockReset();
				render(Header);
				expect(mockAfterNavigate).toHaveBeenCalledOnce();
			});

			it('afterNavigate callback sets sheetOpen to false', async () => {
				mockPage.data.user = null;
				let afterNavigateCallback: (() => void) | undefined;
				mockAfterNavigate.mockImplementation((cb: () => void) => {
					afterNavigateCallback = cb;
				});
				render(Header);
				// Open the sheet
				await page.getByRole('button', { name: 'Abrir menú de navegación' }).click();
				await expect.element(page.getByRole('dialog')).toBeInTheDocument();
				// Simulate navigation
				if (afterNavigateCallback) {
					afterNavigateCallback();
				}
				// Sheet should close — dialog should be removed
				await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
			});
		});
	});
});
