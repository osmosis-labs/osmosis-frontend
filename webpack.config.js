/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const isEnvDevelopment = process.env.NODE_ENV !== 'production';
const isEnvAnalyzer = process.env.ANALYZER === 'true';
const commonResolve = dir => ({
	extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss'],
	alias: {
		assets: path.resolve(__dirname, dir),
	},
});
const sassRule = {
	test: /(\.s?css)|(\.sass)$/,
	oneOf: [
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
				'sass-loader',
			],
		},
		{
			use: ['style-loader', { loader: 'css-loader', options: { modules: false } }, 'sass-loader'],
		},
	],
};
const tsRule = { test: /\.tsx?$/, loader: 'ts-loader' };
const jsxRule = {
	test: /\.(js|jsx)$/,
	exclude: /node_modules/,
	use: {
		loader: 'babel-loader',
	},
};
const fileRule = {
	test: /\.(svg|png|jpe?g|gif|woff|woff2|eot|ttf)$/i,
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

const webConfig = (env, args) => {
	return {
		mode: isEnvDevelopment ? 'development' : 'production',
		// In development environment, turn on source map.
		devtool: isEnvDevelopment ? 'source-map' : false,
		// In development environment, webpack watch the file changes, and recompile
		watch: isEnvDevelopment,
		devServer: {
			port: 8081,
		},
		entry: {
			main: ['./src/index.tsx'],
		},
		output: {
			path: path.resolve(__dirname, isEnvDevelopment ? 'dist' : 'prod'),
			filename: '[name].bundle.js',
		},
		resolve: commonResolve('src/assets'),
		module: {
			rules: [sassRule, tsRule, jsxRule, fileRule],
		},
		optimization: {
			usedExports: true,
		},
		plugins: [
			// Remove all and write anyway
			// TODO: Optimizing build process
			new CleanWebpackPlugin(),
			new ForkTsCheckerWebpackPlugin(),
			new HtmlWebpackPlugin({
				template: './src/index.html',
				filename: 'index.html',
				chunks: ['main'],
			}),
			new WriteFilePlugin(),
			new webpack.EnvironmentPlugin(['NODE_ENV']),
			new BundleAnalyzerPlugin({
				analyzerMode: isEnvAnalyzer ? 'server' : 'disabled',
			}),
		],
	};
};

module.exports = webConfig;
