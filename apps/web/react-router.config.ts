import type { Config } from '@react-router/dev/config';
import { vercelPreset } from '@vercel/react-router/vite';

export default {
	appDirectory: './src/app',
	ssr: true,
	// Don't prerender the catch-all not-found route - it's dynamic by nature
	prerender: false,
	presets: [vercelPreset()],
} satisfies Config;
