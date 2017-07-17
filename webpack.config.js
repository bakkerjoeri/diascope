/*eslint-env node */
const path = require('path');
const webpack = require('webpack');

module.exports = () => {
	const env = process.env.NODE_ENV || 'production';

	let webpackConfig = {
		entry: './src/main.js',
		output: {
			path: path.resolve('./dist'),
			publicPath: '/',
			filename: 'diascope.min.js',
		},
		module: {
			rules: [{
				test: /\.js$/,
				exclude: [
					path.resolve('./node_modules'),
				],
				use: [{
					loader: 'babel-loader',
					options: {
						cacheDirectory: env === 'development' ? true : false
					}
				}],
			}],
		},
		plugins: [
			new webpack.DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify(env)
			})
		]
	};

	if (env === 'development') {
		webpackConfig.devtool = 'cheap-eval-source-map';
	}

	if (env === 'production') {
		webpackConfig.devtool = 'source-map';
		webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
			sourceMap: true,
			extractComments: true,
		}));
		webpackConfig.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
		webpackConfig.plugins.push(new webpack.optimize.ModuleConcatenationPlugin());
	}

	return webpackConfig;
}
