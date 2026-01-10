import type { RouteConfigEntry } from '@react-router/dev/routes';

/**
 * Static route configuration for React Router.
 * 
 * Authentication is now handled by Clerk.
 * Sign-in and sign-up routes use Clerk's embedded components.
 */
const routes: RouteConfigEntry[] = [
	// Index route
	{ index: true, file: './page.jsx' },
	
	// Clerk authentication routes
	{ path: 'sign-in/*', file: './sign-in/page.tsx' },
	{ path: 'sign-up/*', file: './sign-up/page.tsx' },
	
	// Legacy account routes (redirect to new Clerk routes)
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
