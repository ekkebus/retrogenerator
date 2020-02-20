/*
for some Windows environments, change script execution policies first
Run> Set-ExecutionPolicy Unrestricted (as local adminstrator)
*/
const gulp = require('gulp');
const order = require('gulp-order');
//required for HTML
var htmlreplace = require('gulp-html-replace');
//required for CSS
const clean_css = require('gulp-clean-css');
const auto_prefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
//required for JS
//const babel = require('gulp-babel');
const terser = require('gulp-terser');  //replacement for uglify
const jsonminify = require('gulp-jsonminify');

//const jasmine = require('gulp-jasmine');  //works but is really unstable for me
var exec = require('gulp-exec');

//for browser sync
const browserSync = require('browser-sync').create();

const { series, parallel } = require('gulp');

const html = () => {
    return gulp.src('./index.html')
        .pipe(htmlreplace({
            'css': 'style.min.css',
            'js': 'app.min.js'
        }))
        .pipe(gulp.dest('./dist/'))
}

const css = () => {
    return gulp.src('./src/**/*.css')
        //make compatible for old browsers
        .pipe(clean_css({ compatibility: 'ie9' }))
        //auto prefixer for some typen browsers
        .pipe(auto_prefixer('last 2 version', 'safari 5', 'ie 9'))
        .pipe(concat('style.min.css'))
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.stream());
}

const js = () => {
    return gulp.src('./src/js/**/*.js')
        .pipe(order(['app.js'], {
            base: "./"
        }))
        //terser minifies the JS
        .pipe(terser()) 
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.stream());
}

const json = () => {
    return gulp.src('./src/*.json')
        .pipe(jsonminify())
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.stream());
}

const jasmineTest = () => {
    var options = {
        continueOnError: false, // default = false, true means don't emit error event
        pipeStdout: false, // default = false, true means stdout is written to file.contents
        customTemplatingThing: "test" // content passed to lodash.template()
      };
      var reportOptions = {
          err: true, // default = true, false means don't write err
          stderr: true, // default = true, false means don't write stderr
          stdout: true // default = true, false means don't write stdout
      };
    return gulp.src('./spec/*[Sp]ec.js').pipe(exec('jasmine', options))
    .pipe(exec.reporter(reportOptions));
}

//export the build task
exports.build = series(css, js, json, html,jasmineTest);

gulp.task('serve', function () {
    browserSync.init({
        server: './dist/'
    });
    gulp.watch('./src/css/**/*.css', series(css))
    gulp.watch('./**/*.html', series(html))
    gulp.watch('dist/**/*.html').on('change', browserSync.reload);
});