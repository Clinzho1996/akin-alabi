import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			borderRadius: {
				lg: "0.5rem",
			},
			colors: {
				primary: {
					1: "#297C66",
					2: "#D1FAE5",
					3: "#A7F3D0",
					4: "#297C661F",
					5: "#ECFAF6",
					6: "#6B7280",
				},
				secondary: {
					1: "#073212",
					2: "#FFF8EB",
					3: "#FFDA97",
				},
				dark: {
					1: "#0A0D14",
					2: "#6B7280",
					3: "#6B728080",
				},
				red: "#F43F5E",
			},

			fontFamily: {
				inter: "var(--font-inter)",
				"ibm-plex-serif": "var(--font-ibm-plex-serif)",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
