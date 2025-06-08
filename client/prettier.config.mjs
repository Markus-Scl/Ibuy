// prettier.config.js, .prettierrc.js, prettier.config.mjs, or .prettierrc.mjs

/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
	trailingComma: 'es5', // Do not add trailing commas
	tabWidth: 2, // Use 2 spaces for each indentation level
	useTabs: false, // Use spaces instead of tabs
	semi: true, // Add semicolons at the end of statements
	singleQuote: true, // Use single quotes for strings
	arrowParens: 'always', // Always include parentheses in arrow functions
	printWidth: 120, // Print width is 120 characters
};

export default config;
