import type { Config } from '@react-router/dev/config';

export default {
	appDirectory: './src/app',
	ssr: true,
	// Don't prerender the catch-all not-found route - it's dynamic by nature
	prerender: false,
} satisfies Config;
