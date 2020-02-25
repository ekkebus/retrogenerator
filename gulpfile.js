/* eslint-disable no-undef */
/*
for some Windows environments, change script execution policies first
Run powershell> Set-ExecutionPolicy Unrestricted (as local adminstrator)
*/
const gulp = require('gulp')
const order = require('gulp-order')
const tap = require('gulp-tap')
//required for HTML
const htmlreplace = require('gulp-html-replace')
const htmlValidator = require('gulp-w3c-html-validator')
const htmlmin = require('gulp-htmlmin')
const vulcanize = require('gulp-vulcanize')
//required for CSS
const clean_css = require('gulp-clean-css')
const auto_prefixer = require('gulp-autoprefixer')
const concat = require('gulp-concat')
//required for JS
const terser = require('gulp-terser')  //replacement for uglify
const jsonminify = require('gulp-jsonminify')
const eslint = require('gulp-eslint')
//const babel = require('gulp-babel')

//const jasmine = require('gulp-jasmine');  //works but is really unstable for me
const exec = require('gulp-exec')

//for browser sync
const browserSync = require('browser-sync').create()

const { series } = require('gulp')

const html = () => {
    return gulp.src('./app.html')
        .pipe(htmlreplace({
            'css': './dist/style.min.css',
            'js': './dist/app.min.js'
        }))
        .pipe(concat('index.html'))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('./'))
}

const css = () => {
    return gulp.src('./src/**/*.css')
        //make compatible for old browsers
        .pipe(clean_css({ compatibility: 'ie9' }))
        //auto prefixer for some typen browsers
        .pipe(auto_prefixer('last 2 version', 'safari 5', 'ie 9'))
        .pipe(concat('style.min.css'))
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.stream())
}

const js = () => {
    return gulp.src('./src/js/**/*.js')
        .pipe(order(['app.js'], {
            base: "./"
        }))
        //babel breaks the build
        // .pipe(babel({
        //     presets: ['@babel/env']
        // }))
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(terser()) //terser minifies the JS
        .pipe(concat('app.min.js'))
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.stream())
}

const json = () => {
    return gulp.src('./src/*.json')
        .pipe(jsonminify())
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.stream())
}

const buildRelease = () => {
    return gulp.src('./index.html').pipe(vulcanize({
        stripComments: true,
        inlineScripts: true,
        inlineCss: true
    })).pipe(gulp.dest('./'))
}

const jasmineTest = () => {
    var options = {
        continueOnError: false,
        pipeStdout: true
    }
    var reportOptions = {
        err: true,
        stderr: true,
        stdout: true
    }
    return gulp.src('./spec/*[Sp]ec.js')
        .pipe(tap(function (file) {
            // feeding the file.path returned from gulp.src gives errors

            // eslint-disable-next-line no-useless-escape
            let specFileName = './spec/' + file.path.replace(/^.*[\\\/]/, '')
            file.path = specFileName
            return file
        }))
        .pipe(exec("jasmine <%= file.path %>", options))
        .pipe(exec.reporter(reportOptions))
}

// eslint-disable-next-line no-unused-vars
const w3cValidation = () => {
    return gulp.src('./*.html')
        .pipe(htmlValidator())
        .pipe(htmlValidator.reporter())
}

//export the build and test task
exports.build = series(css, js, json, html, jasmineTest, buildRelease, w3cValidation)

exports.test = series(jasmineTest)

gulp.task('serve', function () {
    browserSync.init({
        server: './dist/'
    })
    gulp.watch('./src/css/**/*.css', series(css))
    gulp.watch('./**/*.html', series(html))
    gulp.watch('./index.html').on('change', browserSync.reload)
});