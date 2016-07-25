import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';

import del from 'del';
import fs from 'fs';
import path from 'path';

import { argv } from 'yargs';
var filter = argv.filter ? '/' + argv.filter : '';

const $ = gulpLoadPlugins();


const SRC = 'src/banners' + filter;

const srcSCSS = SRC+'/**/*.scss';
const srcScripts = SRC+'/**/*.js';
const srcHtml = SRC+'/**/*.html';
const srcConfig = SRC+'/**/*/config.json';
const srcImages = [SRC+'/**/*.png', SRC+'/**/*.gif', SRC+'/**/*.jpg', SRC+'/**/*.svg', SRC+'/**/*.psd'];

const srcMasks = ['src/masks/**/*.png', 'src/masks/**/*.gif'];

const DEST = 'build' + filter;
const ZIPPED = 'zipped';

const destUrlsMap = 'urls.json';

gulp.task('clean', () => {
    // substring makes us sure that we clean whole content even if filter parameter is passed
    return del([DEST.substring(0, DEST.indexOf('/')), ZIPPED, destUrlsMap]);
});

gulp.task('styles', () => {
    gulp.src(srcSCSS)
        .pipe($.cached('styles'))
        .pipe($.plumber())
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
        .pipe($.cssnano())
        .pipe(gulp.dest(DEST))
});


gulp.task('scripts', () => {
    gulp.src(srcScripts)
        .pipe($.cached('scripts'))
        .pipe($.plumber())
        .pipe($.babel())
        .pipe($.uglify())
        .pipe(gulp.dest(DEST));
});

gulp.task('jshint', () => {
    return gulp.src(srcScripts)
        .pipe(browserSync.reload({ stream: true, once: true }))
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});

gulp.task('jsonDirs', () => {
    return gulp.src(srcConfig)
        .pipe($.directoryMap({
            filename: destUrlsMap,
            prefix: filter.substring(1)
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('html', ['jsonDirs'], () => {
    gulp.src(srcHtml)
        .pipe($.cached('html'))
        .pipe($.htmlmin({ collapseWhitespace: true }))
        .pipe($.minifyInlineScripts())
        .pipe(gulp.dest(DEST));
});

gulp.task('images', () => {
    gulp.src(srcImages)
        .pipe($.cached('images'))
        .pipe(gulp.dest(DEST));
});

// returns array with paths to dirs with config.json file
var banners = [];
function getBanners(list) {
    for(var key in list) {
        if (list.hasOwnProperty(key)) {
            var value = list[key];

            if (value['config.json']) {
                banners.push(DEST + '/' + value['config.json'].replace('/config.json' ,''));
            } else {
                banners.concat(getBanners(value));
            }
        }
    }

    return banners;
}

gulp.task('zip', () => {
    let folders = getBanners(require('./'+destUrlsMap));
    folders.map((folder) => {
        let filename = folder.replace(DEST + '/', '').replace(/\//g, '_');
        return gulp.src(folder+'/**/*')
            .pipe($.zip(filename+'.zip'))
            .pipe(gulp.dest(ZIPPED));
    });
});


var watcher = (gulp) => {
    gulp.watch(srcHtml, ['html']);
    gulp.watch(srcImages, ['images']);
    gulp.watch(srcSCSS, ['styles']);
    gulp.watch(srcScripts, ['scripts']);
};

gulp.task('serve', ['build'], () => {
    watcher(gulp);

    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['./']
        },
        // This is to send event to the index.html page to refresh iframe
        // source https://github.com/BrowserSync/browser-sync/issues/662#issuecomment-110478137
        plugins: [{
            plugin: () => {}, // required for plugin system :(
            hooks: {
                "client:js": require('fs').readFileSync('refresh.js', 'utf-8')
            }
        }]
    }, (err, instance) => {
        // Custom watcher for all files with test/fixtures directory
        browserSync.watch([srcMasks, srcConfig, DEST+'/**/*']).on('change', (file) => {
            // Emit custom event to clients
            instance.io.sockets.emit('custom-event', { file: file })
        });
    });
});

gulp.task('build', ['clean'], (cb) => {
    runSequence(['html', 'images', 'styles', 'scripts'], cb);
});

gulp.task('default', ['build']);
