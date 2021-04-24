module.exports = {
	parser: '@typescript-eslint/parser',
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:react/recommended',
		'plugin:prettier/recommended',
		'prettier/react',
		'prettier/standard',
		'plugin:import/typescript',
		'plugin:prettier/recommended', // Make this the last element so prettier config overrides other formatting rules
	],
	plugins: ['react-hooks', 'unicorn', 'import'],
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	rules: {
		'prettier/prettier': ['error', {}, { usePrettierrc: true }],
		'react/prop-types': 'off',
		'react/self-closing-comp': 'error',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/no-use-before-define': 'off',
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'warn',
		'@typescript-eslint/no-unused-vars': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'unicorn/filename-case': [
			'off',
			{
				case: 'kebabCase',
			},
		],
		'import/no-extraneous-dependencies': [
			'error',
			{
				devDependencies: ['**/*.spec.ts', '**/*.spec.js', '**/webpack.config.js'],
			},
		],
	},
	settings: {
		react: {
			version: 'detect',
		},
	},
};
