import type { RouteConfigEntry } from '@react-router/dev/routes';

/**
 * Static route configuration for React Router.
 * 
 * IMPORTANT: API routes (/api/*) are NOT handled by React Router.
 * They are handled by:
 * - Local dev: Hono server in __create/index.ts
 * - Vercel: Dedicated Vercel Functions in api/ directory
 * 
 * The catch-all route excludes /api/* paths to prevent 405 errors
 * when Better Auth makes POST requests to /api/auth/*.
 */
const routes: RouteConfigEntry[] = [
	// Index route
	{ index: true, file: './page.jsx' },
	
	// Account routes
	{ path: 'account/logout', file: './account/logout/page.jsx' },
	{ path: 'account/signin', file: './account/signin/page.jsx' },
	{ path: 'account/signup', file: './account/signup/page.jsx' },
	
	// Main app routes
	{ path: 'assessment', file: './assessment/page.jsx' },
	{ path: 'assessment-intro', file: './assessment-intro/page.jsx' },
	{ path: 'dashboard', file: './dashboard/page.jsx' },
	{ path: 'history', file: './history/page.jsx' },
	{ path: 'profile', file: './profile/page.jsx' },
	{ path: 'results', file: './results/page.jsx' },
	{ path: 'welcome', file: './welcome/page.jsx' },
	
	// Catch-all for 404 - excludes API routes which are handled by Hono/Vercel Functions
	{ path: '*', file: './__create/not-found.tsx' },
] as RouteConfigEntry[];

export default routes;
