import type { Config } from '@react-router/dev/config';

/**
 * React Router Configuration for Vercel Serverless
 * 
 * IMPORTANT: This config is for UI routing only.
 * Better Auth API routes are handled by a dedicated Vercel Function
 * at /api/auth/[...auth].ts, NOT through React Router.
 * 
 * Architecture:
 * - /api/auth/* → Vercel Function (api/auth/[...auth].ts)
 * - All other routes → React Router (this config)
 */
export default {
	// App directory containing routes
	appDirectory: './src/app',
	
	// Server-side rendering enabled
	ssr: true,
	
	// Don't prerender - routes are dynamic
	prerender: false,
	
	// Build output directory
	buildDirectory: 'build',
	
	// Server build output file
	serverBuildFile: 'index.js',
	
	// No presets - Vercel handles deployment via its own function wrappers
	// The react-router-hono-server plugin is still used for local development
} satisfies Config;
