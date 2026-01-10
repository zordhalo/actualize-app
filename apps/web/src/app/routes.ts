import type { RouteConfigEntry } from '@react-router/dev/routes';

// Static route configuration - more reliable than dynamic file scanning
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
	
	// Catch-all for 404
	{ path: '*', file: './__create/not-found.tsx' },
] as RouteConfigEntry[];

export default routes;
