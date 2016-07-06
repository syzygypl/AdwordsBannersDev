import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import browserSync from 'browser-sync';

const $ = gulpLoadPlugins();
const del = require('del');
const reload = browserSync.reload;
const srcSCSS = 'dev/**/*.scss';
const srcScripts = 'dev/**/*.js';
const srcHtml = 'dev/**/*.html';
const srcImages = ['dev/**/*.png','dev/**/*.jpg','dev/**/*.svg'];

const DEST = 'output';
const ZIPPED = 'zipped';

const fs = require('fs');
const path = require('path');
//gulpLoadPlugins does not work with plugins with dashes (?)
const minifyInline = require('gulp-minify-inline-scripts');
const directoryMap = require("gulp-directory-map");


gulp.task('clean', () => {
    del([DEST, ZIPPED]);
});

gulp.task('styles', () => {
    return gulp.src(srcSCSS)
        .pipe($.changed(DEST))
        .pipe($.plumber())
        .pipe($.sass.sync({
            outputStyle: 'expanded',
            precision: 10,
            includePaths: ['.']
        }).on('error', $.sass.logError))
        .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
        .pipe($.cssnano())
        .pipe(gulp.dest(DEST))
        //uncomment if you want whole page to reload
        // .pipe(reload({stream: true}));
});

gulp.task('jsonDirs', () => {
    return gulp.src(srcHtml)
        .pipe(directoryMap({
            filename: 'urls.json'
        }))
        .pipe(gulp.dest(DEST));
});

gulp.task('scripts', () => {
    return gulp.src(srcScripts)
        .pipe($.changed(DEST))
        .pipe($.plumber())
        .pipe($.babel())
        .pipe($.uglify())
        .pipe(gulp.dest(DEST))
        //uncomment if you want whole page to reload
        // .pipe(reload({stream: true}));
});

function jshint(files, options) {
    return () => {
        return gulp.src(files)
            .pipe(reload({stream: true, once: true}))
            .pipe($.jshint())
            .pipe($.jshint.reporter('jshint-stylish'))
            .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));  };
}

gulp.task('jshint', jshint(srcScripts));

gulp.task('html', function() {
    return gulp.src(srcHtml)
        .pipe($.changed(DEST))
        .pipe($.htmlmin({collapseWhitespace: true}))
        .pipe(minifyInline())
        .pipe(gulp.dest(DEST))
        //uncomment if you want whole page to reload
        // .pipe(reload({stream: true}));
});

gulp.task('images', function() {
    return gulp.src(srcImages)
        .pipe(gulp.dest(DEST))
        //uncomment if you want whole page to reload
        // .pipe(reload({stream: true}));
});

gulp.task('serve', () => {
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: ['./'],
        },
        //this is to send event to the index.html page to refresh iframe
        //source https://github.com/BrowserSync/browser-sync/issues/662#issuecomment-110478137
        plugins: [
            {
                plugin: function () {}, // required for plugin system :(
                hooks: {
                    "client:js": require('fs').readFileSync('refresh.js', 'utf-8')
                }
            }
        ]
    }, function (err, instance) {

        /**
         * Your custom watcher for all files with test/fixtures directory
         */
        browserSync.watch("dev/**/*").on('change', function (file) {

            /**
             * Emit custom event to clients
             */

            setTimeout(()=>instance.io.sockets.emit('custom-event', {file: file}),500)
        });
    });

    gulp.watch('dev/**/*.scss', ['styles']);
    gulp.watch('dev/**/*.js', ['scripts']);
    gulp.watch('dev/**/*.html', ['html']);
    gulp.watch('dev/**/*.html', ['jsonDirs']);
    gulp.watch(['dev/**/*.png','dev/**/*.jpg','dev/**/*.svg'], ['images']);
});


// returns recursively dirs fitting to [width]x[height] pattern
function getFolders(dir) {
    var results = [];
    var list = fs.readdirSync(dir);
    var regex = /^[0-9]+x[0-9]+$/;
    list.forEach(function(fileName) {
        var file = dir + '/' + fileName;
        var stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (regex.test(fileName)) {
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
    let tasks = folders.map(function(folder){
        let filename = folder.replace(DEST+'/', '').replace(/\//g, '_');
        console.log(filename);
        return gulp.src(folder+'/**/*')
            .pipe($.zip(filename+'.zip'))
            .pipe(gulp.dest(ZIPPED));
    });
});

gulp.task('build', ['clean'], function() {
    gulp.start(['html', 'images', 'styles', 'scripts', 'jsonDirs']);
});
gulp.task('default', ['build']);