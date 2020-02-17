/*
for some Windows environments, change script execution policies first
Run> Set-ExecutionPolicy Unrestricted (as local adminstrator)
*/

//gulpfile.js
const gulp = require('gulp');
const order = require('gulp-order');
//requires for HTML
var htmlreplace = require('gulp-html-replace');
//requires for CSS
const clean_css = require('gulp-clean-css');
const auto_prefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
//requires for JS
//const babel = require('gulp-babel');
const terser = require('gulp-terser');  //replacement for uglify

//for browser sync
const browserSync = require('browser-sync').create();

const { series, parallel } = require('gulp');

const html = () => {
    return gulp.src('./index.html')
        .pipe(htmlreplace({
            'css': 'style.min.css',
            'js': 'app.min.js'
        }))
        .pipe(gulp.dest('dist'))
}

const css = () => {
    return gulp.src('./src/**/*.css')
        //make compatible for old browsers
        .pipe(clean_css({ compatibility: 'ie9' }))
        //auto prefixer for some typen browsers
        .pipe(auto_prefixer('last 2 version', 'safari 5', 'ie 9'))
        .pipe(concat('style.min.css'))
        .pipe(gulp.dest('./dist'))
        .pipe(browserSync.stream());
        
}

const js = () =>  {
    return gulp.src('./src/js/**/*.js')
        .pipe(order(['app.js'], {
            base: "./"
        }))
        .pipe(terser())
        .pipe(concat('app.min.js'))
        /*
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        */
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.stream());
}

exports.build = series(css, js, html);


gulp.task('serve', function() {
    browserSync.init({
        server: "./"
    });
    gulp.watch("./src/css/**/*.css", series(css))
    gulp.watch("./**/*.html", series(html))
    gulp.watch("dist/**/*.html").on('change', browserSync.reload);
});
