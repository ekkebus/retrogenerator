/* eslint-disable no-undef */
/*
for some Windows environments, change script execution policies first
Run powershell> Set-ExecutionPolicy Unrestricted (as local adminstrator)
*/
const gulp = require('gulp');
const order = require('gulp-order');
//required for HTML
var htmlreplace = require('gulp-html-replace');
var htmlValidator = require('gulp-w3c-html-validator');
//required for CSS
const clean_css = require('gulp-clean-css');
const auto_prefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
//required for JS
const terser = require('gulp-terser');  //replacement for uglify
const jsonminify = require('gulp-jsonminify');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');

//const jasmine = require('gulp-jasmine');  //works but is really unstable for me
var exec = require('gulp-exec');

//for browser sync
const browserSync = require('browser-sync').create();

const { series } = require('gulp');

const html = () => {
    return gulp.src('./index.html')
        .pipe(htmlreplace({
            'css': 'style.min.css',
            'js': 'app.min.js'
        }))
        .pipe(gulp.dest('./dist/'))
}

const validateHtml = () => {
    return gulp.src('./index.html')
    .pipe(htmlValidator())
    .pipe(htmlValidator.reporter());
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
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(terser()) //terser minifies the JS
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
        continueOnError: false,
        pipeStdout: false,
        customTemplatingThing: "test"
    };
    var reportOptions = {
        err: true,
        stderr: true,
        stdout: true
    };
    return gulp.src('./spec/*[Sp]ec.js').
        pipe(exec('jasmine', options))
        .pipe(exec.reporter(reportOptions));

        /*
        pipe(foreach((stream, file) => {
            exec('jasmine ' + file.path, options);
            return;
          }))
        .pipe(exec.reporter(reportOptions));
        */
}

//export the build task
exports.build = series(css, js, json, validateHtml, html, jasmineTest);

gulp.task('serve', function () {
    browserSync.init({
        server: './dist/'
    });
    gulp.watch('./src/css/**/*.css', series(css))
    gulp.watch('./**/*.html', series(html))
    gulp.watch('dist/**/*.html').on('change', browserSync.reload);
});