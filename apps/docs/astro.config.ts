// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { sidebar } from './src/content/sidebar';
import starlightCatppuccin from '@catppuccin/starlight'
import starlightLinksValidator from 'starlight-links-validator';

// https://astro.build/config
export default defineConfig({
	site: 'https://docs.simplist.app.bernitec.it',
	integrations: [
		starlight({
			plugins: [
				starlightCatppuccin({
					dark: { flavor: 'mocha', accent: 'blue' },
					light: { flavor: 'latte', accent: 'blue' }
				}),
				starlightLinksValidator()
			],
			title: 'Simplist Docs',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/bernagit/simplist' }],
			locales: {
				root: {
					label: 'Italiano',
					lang: 'it',
				},
				en: {
					label: 'English',
					lang: 'en',
				},
			},
			defaultLocale: 'root',
			logo: {
				dark: './src/assets/logo-dark.webp',
				light: './src/assets/logo-light.webp',
				alt: 'Simplist Logo',
			},
			sidebar
		}),
	],
});
