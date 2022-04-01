/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const isEnvDevelopment = process.env.NODE_ENV !== 'production';
const isEnvAnalyzer = process.env.ANALYZER === 'true';
const commonResolve = dir => ({
	extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'],
	alias: {
		assets: path.resolve(__dirname, dir),
	},
	plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
});

const sassRule = {
	test: /(\.s?css)|(\.sass)$/,
	exclude: /node_modules/,
	oneOf: [
		{
			test: /\.(s?css)|(sass)$/,
			use: [
				MiniCssExtractPlugin.loader,
				'css-loader',
				'postcss-loader',
				{
					loader: 'sass-loader',
					options: {
						implementation: require('sass'),
					},
				},
			],
		},
		// if ext includes module as prefix, it perform by css loader.
		{
			test: /.module(\.s?css)|(\.sass)$/,
			use: [
				'style-loader',
				{
					loader: 'css-loader',
					options: {
						modules: {
							localIdentName: '[local]-[hash:base64]',
						},
						localsConvention: 'camelCase',
					},
				},
				{
					loader: 'sass-loader',
					options: {
						implementation: require('sass'),
					},
				},
			],
		},
		{
			use: [
				'style-loader',
				{ loader: 'css-loader', options: { modules: false } },
				{
					loader: 'sass-loader',
					options: {
						implementation: require('sass'),
					},
				},
			],
		},
	],
};

const cssRule = {
	test: /\.css$/,
	use: ['style-loader', 'css-loader'],
};

const tsRule = {
	test: /\.tsx?$/,
	exclude: /node_modules/,
	use: [
		{
			loader: require.resolve('ts-loader'),
			options: {},
		},
	],
};
const jsxRule = {
	test: /\.(js|jsx)$/,
	exclude: /node_modules/,
	use: {
		loader: 'babel-loader',
	},
};
const fileRule = {
	test: /\.(svg|png|jpe?g|gif|woff|woff2|eot|ttf)$/i,
	exclude: /node_modules/,
	use: [
		{
			loader: 'file-loader',
			options: {
				name: '[name].[ext]',
				publicPath: 'assets',
				outputPath: 'assets',
			},
		},
	],
};

//  https://webpack.js.org/guides/public-path/
const ASSET_PATH = process.env.ASSET_PATH || '/';
const webConfig = () => {
	return {
		mode: isEnvDevelopment ? 'development' : 'production',

		// In development environment, turn on source map.
		devtool: isEnvDevelopment ? 'source-map' : false,
		// In development environment, webpack watch the file changes, and recompile
		watch: isEnvDevelopment,
		devServer: {
			port: 8080,
			historyApiFallback: true,
		},
		entry: {
			main: ['./src/index.tsx'],
		},
		output: {
			path: path.resolve(__dirname, isEnvDevelopment ? 'dist' : 'prod'),
			filename: '[name].bundle.js',
			publicPath: ASSET_PATH,
		},
		resolve: commonResolve('src/assets'),
		module: {
			rules: [sassRule, cssRule, tsRule, jsxRule, fileRule],
		},
		optimization: {
			usedExports: true,
		},
		plugins: [
			// Remove all and write anyway
			// TODO: Optimizing build process
			new CleanWebpackPlugin(),
			new CopyWebpackPlugin({
				patterns: [
					{ from: 'public', to: 'public' },
					{ from: './src/404.html', to: '404.html', toType: 'file' },
				],
			}),
			new ForkTsCheckerWebpackPlugin(),
			new MiniCssExtractPlugin({
				filename: 'styles.css',
				chunkFilename: '[name].css',
			}),
			new HtmlWebpackPlugin({
				template: './src/index.html',
				filename: 'index.html',
				chunks: ['main'],
			}),
			new HtmlWebpackPlugin({
				template: 'src/404.html',
			}),
			new WriteFilePlugin(),
			new webpack.EnvironmentPlugin(['NODE_ENV', 'LOCALNET']),
			isEnvAnalyzer &&
				new BundleAnalyzerPlugin({
					analyzerMode: isEnvAnalyzer ? 'server' : 'disabled',
				}),
			// This makes it possible for us to safely use env vars on our code
			new webpack.DefinePlugin({
				'process.env.ASSET_PATH': JSON.stringify(ASSET_PATH),
			}),
		].filter(Boolean),
	};
};

module.exports = webConfig;
