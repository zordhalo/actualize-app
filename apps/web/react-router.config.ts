import type { Config } from '@react-router/dev/config';
// Note: vercelPreset() was removed because it bypasses the Hono server entry point.
// The react-router-hono-server plugin handles deployment to Vercel correctly
// while preserving our custom Hono routes (including BetterAuth handlers).

export default {
	appDirectory: './src/app',
	ssr: true,
	// Don't prerender the catch-all not-found route - it's dynamic by nature
	prerender: false,
	// No presets - let react-router-hono-server handle deployment
} satisfies Config;
