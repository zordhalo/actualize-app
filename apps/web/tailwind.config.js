module.exports = {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		fontFamily: {
			// Primary display font - bold, condensed sans-serif for headings
			display: ['Oswald', 'sans-serif'],
			// Body/navigation font - clean, readable sans-serif
			sans: ['Montserrat', 'sans-serif'],
			// Script/accent font - elegant cursive for taglines
			script: ['Allura', 'cursive'],
		},
		extend: {
			colors: {
				// Actualize Brand Colors
				brand: {
					red: '#CC0000',
					'red-dark': '#A30000',
					'red-light': '#DC143C',
					black: '#000000',
					charcoal: '#1A1A1A',
					'charcoal-light': '#2B2B2B',
					white: '#FFFFFF',
					lime: '#ADFF2F',
					'lime-dark': '#8BC34A',
				},
				// Semantic colors
				actualize: '#CC0000',
				surface: '#1A1A1A',
				'surface-light': '#2B2B2B',
			},
			backgroundImage: {
				// Starry gradient background
				'starry-gradient': 'radial-gradient(ellipse at center, #1A1A1A 0%, #000000 100%)',
			},
			animation: {
				'sparkle': 'sparkle 2s ease-in-out infinite',
				'pulse-slow': 'pulse 3s ease-in-out infinite',
			},
			keyframes: {
				sparkle: {
					'0%, 100%': { opacity: '0.3' },
					'50%': { opacity: '1' },
				},
			},
		},
	},
	plugins: [],
};
