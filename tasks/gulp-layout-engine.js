const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const eventStream = require('event-stream');

var cache;

module.exports = (gulp, { connect }) => {

    gulp.task('build-layout-engine', () => {

        const rollupStream = rollup({
            entry: 'layout-engine/www/index.ts',
            format: 'iife',
            useStrict: true,
            sourceMap: 'inline',
            external: [
                'd3'
            ],
            cache,
            plugins: [
                require('rollup-plugin-typescript')({
                    typescript: require('typescript'),
                    target: 'es5'
                })
            ]
        });

        return rollupStream
            .on('bundle', (bundle) => cache = bundle)
            .on('error', function (err) {
                cache = null;
                console.error('\x1b[31m', [
                    '',
                    '.========================.',
                    '!                        !',
                    '! TYPESCRIPT BUILD ERROR !',
                    '!                        !',
                    '*========================*'
                ].join('\n'));
                console.error('\x1b[0m', err);
                this.emit('end');
            })
            .pipe(source('index.js'))
            .pipe(gulp.dest('layout-engine/www/'))
            .pipe(connect.reload());

    });

    gulp.task('watch-layout-engine', ['build-layout-engine'], () => {
        const server = connect.server({
            host: '0.0.0.0',
            port: 9001,
            root: './',
            livereload: true
        });
        gulp.watch(
            ['layout-engine/**/*.ts', 'layout-engine/www/index.html'],
            ['build-layout-engine']);
    });
};