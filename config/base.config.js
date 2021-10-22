const path = require('path');

const Config = require('webpack-chain');
const config = new Config();

const context = process.cwd();

config
    .entry('app')
        .add(path.resolve(context, 'source', 'scripts', 'app.js'))
        .end()
    .output()
        .path(path.resolve(context, 'public', 'assets'))
        .publicPath('/assets/scripts')
        .filename('scripts/[name].js')
        .clean(true)
        .end();

config.module
    .rule('css')
    .test(/\.(sa|sc|c)ss$/i)
    .use('css')
        .loader(process.env.NODE_ENV !== 'production' ? 'style-loader' : MiniCssExtractPlugin.loader)
        .loader('css-loader')
        .loader('sass-loader')
            .options({
                loader: 'sass-loader',
                options: {
                    sourceMap: true, // TODO
                    implementation: require('sass'),
                },
            })
        .end();