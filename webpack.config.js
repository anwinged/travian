const path = require('path');

module.exports = (env = {}) => ({
    mode: env.production ? 'production' : 'development',
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
        filename: env.production ? 'travian.min.js' : 'travian.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'travian',
        libraryTarget: 'umd',
        umdNamedDefine: true,
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'ts-loader',
                },
            },
        ],
    },
});
