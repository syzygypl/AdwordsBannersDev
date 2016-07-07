import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';

import del from 'del';
import fs from 'fs';
import path from 'path';

const $ = gulpLoadPlugins();

const srcSCSS = 'dev/**/*.scss';
const srcScripts = 'dev/**/*.js';
const srcHtml = 'dev/**/*.html';
const srcImages = ['dev/**/*.png','dev/**/*.jpg','dev/**/*.svg'];

const DEST = 'output';
const ZIPPED = 'zipped';

gulp.task('clean', () => {
    return del([DEST, ZIPPED]);
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
    return gulp.src(srcHtml)
        .pipe($.directoryMap({
            filename: 'urls.json'
        }))
        .pipe(gulp.dest(DEST));
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


// returns recursively dirs fitting to [width]x[height] pattern
function getFolders(dir) {
    var results = [];
    var list = fs.readdirSync(dir);

    const dirPattern = /[0-9]+x[0-9]+([_].{1,})?$/;
    list.forEach((fileName) => {
        let file = dir + '/' + fileName;
        let stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (dirPattern.test(fileName)) {
                results.push(file);
            } else {
                results = results.concat(getFolders(file));
            }
        }
    });
    return results;
}

gulp.task('zip', () => {
    let folders = getFolders(DEST);
    folders.map((folder) => {
        let filename = folder.replace(DEST+'/', '').replace(/\//g, '_');
        return gulp.src(folder+'/**/*')
            .pipe($.zip(filename+'.zip'))
            .pipe(gulp.dest(ZIPPED));
    });
});

var watcher = (gulp) => {
    gulp.watch('dev/**/*.html', ['html']);
    gulp.watch(['dev/**/*.png','dev/**/*.jpg','dev/**/*.svg'], ['images']);
    gulp.watch('dev/**/*.scss', ['styles']);
    gulp.watch('dev/**/*.js', ['scripts']);
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
        browserSync.watch(DEST+'/**/*').on('change', (file) => {
            // Emit custom event to clients
            instance.io.sockets.emit('custom-event', { file: file })
        });
    });
});

gulp.task('build', ['clean'], (cb) => {
    runSequence(['html', 'images', 'styles', 'scripts'], cb);
});
gulp.task('default', ['build']);
