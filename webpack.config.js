const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
	entry: './frontend/app.js',
	mode: 'development',
	output: {
		path: path.join(__dirname, 'backend/public'),
		filename: 'js/bundle.js'
		//filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.css/,
				use: [ devMode ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader' ]
			},
			{
				test: /\.ejs$/,
				use: [
					{
						loader: 'ejs-webpack-loader',
						options: {
							data: { title: 'CIGNIUM Technologies', someVar: 'hello world' },
							htmlmin: false
						}
					}
				]
			},
			{
				test: /\.html$/i,
				loader: 'html-loader'
			}
		]
	},
	node: {
		fs: 'empty'
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './frontend/index.ejs',
			minify: {
				collapseWhitespace: true,
				removeComments: true,
				removeRedundantAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				useShortDoctype: true
			}
		}),
		new HtmlWebpackPlugin({
			filename: 'updatedidinfo.html',
			template: './frontend/updatedidinfo.ejs',
			minify: {
				collapseWhitespace: true,
				removeComments: true,
				removeRedundantAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				useShortDoctype: true
			}
		}),
		new MiniCssExtractPlugin({
			filename: 'css/bundle.css'
		})
	],
	devtool: 'source-map'
};
