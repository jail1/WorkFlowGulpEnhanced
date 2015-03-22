// ##################################################################################################################################
/* Author: Iacob Silviu - Iulian
/* Project: WorkflowWithGulp
/* Date: 3 / 21 / 2015
// ################################################################################################################################*/
// Nodejs Requires 
// ##################################################################################################################################

var gulp 		= require('gulp'),
	gutil 		= require('gulp-util'),
	coffee		= require('gulp-coffee'),
	compass		= require('gulp-compass'),
	browserify	= require('gulp-browserify'),
	concat		= require('gulp-concat'),
	minifycss	= require('gulp-minify-css'),
	minifyhtml  = require('gulp-minify-html'),
	jsonminify  = require('gulp-jsonminify'),
	guglify		= require('gulp-uglify'),
	gulpif 		= require('gulp-if'),
	connect		= require('gulp-connect');

var env, coffeeSources, jsSources, sassSources, staticSources, jsonSources, sassStyle, outputDir;
var env = process.env.NODE_ENV || 'development';
var prod = env === 'development' ? false : true;

if(env === 'development') {
	outputDir = 'builds/development/';
	sassStyle = 'expanded';
} else {
	outputDir = 'builds/production/';
	sassStyle = 'compressed';
}

// ##################################################################################################################################
// File locations
// ##################################################################################################################################

	coffeeSources = ['components/coffee/tagline.coffee'],
    jsSources	  = ['components/scripts/rclick.js', 
					 'components/scripts/pixgrid.js',
				 	 'components/scripts/tagline.js',
				 	 'components/scripts/template.js'],
 	sassSources	  = ['components/sass/style.scss'],
 	staticSources = [outputDir + '*.html', outputDir + '*.php'],
 	jsonSources   = [outputDir + 'js/*.json'];

// ##################################################################################################################################
// CoffeeScript Task
// ##################################################################################################################################

gulp.task('coffee', function() {
	gulp.src(coffeeSources)
		.pipe(coffee({ bare: true }).on('error', gutil.log))	//compiles to js w/o putting it into a secured wrapper.
		.pipe(gulp.dest('components/scripts'));
});

// ##################################################################################################################################
// JavaScript Task
// ##################################################################################################################################

gulp.task('js', function() {
	gulp.src(jsSources)
		.pipe(concat('script.js'))
		.pipe(browserify())
		.pipe(gulpif(prod, guglify()))
		.pipe(gulp.dest(outputDir + 'js'))
		.pipe(connect.reload());
});

// ##################################################################################################################################
// Compass Task
// ##################################################################################################################################

gulp.task('compass', function() {
	gulp.src(sassSources)
		.pipe(compass({
			sass: 'components/sass',
			image: outputDir + 'images',
			style: sassStyle
		}).on('error', gutil.log))
		.pipe(gulpif(prod, minifycss()))
		.pipe(gulp.dest(outputDir + 'css'))
		.pipe(connect.reload());
});

// ##################################################################################################################################
// Satic (~ HTML, PHP, etc ~) Task
// ##################################################################################################################################

gulp.task('static', function() {
	gulp.src('builds/development/*.html')
		.pipe(gulpif(prod, minifyhtml()))
		.pipe(gulpif(prod, gulp.dest(outputDir)))
		.pipe(connect.reload());
});

// ##################################################################################################################################
// Json Task
// ##################################################################################################################################

gulp.task('json', function() {
	gulp.src('builds/development/js/*.json')
		.pipe(gulpif(prod, jsonminify()))
		.pipe(gulpif(prod, gulp.dest('builds/production/js/')))
		.pipe(connect.reload());
});

// ##################################################################################################################################
// Images Task
// ##################################################################################################################################

gulp.task('images', function() {
	gulp.src('builds/development/images/**/*.*')
		.pipe(gulpif(prod, gulp.dest('builds/production/images/')))
		.pipe(connect.reload());
});

// ##################################################################################################################################
// Watch Task
// ##################################################################################################################################

gulp.task('watch', function() {
	gulp.watch(coffeeSources, ['coffee']);
	gulp.watch(jsSources, ['js']);
	gulp.watch('components/sass/*.scss', ['compass']);
	gulp.watch('builds/development/*.html', ['static']);
	gulp.watch('builds/development/js/*.json', ['json']);
	gulp.watch('builds/development/images/**/*.*', ['images']);
});

// ##################################################################################################################################
// Connect (~ Server ~) Task
// ##################################################################################################################################

gulp.task('connect', function() {
	connect.server({
		root: outputDir,
		livereload: true
	});
});

// ##################################################################################################################################
// Default Task
// ##################################################################################################################################

gulp.task('default', ['static', 'json', 'coffee', 'js', 'compass', 'images', 'connect', 'watch']); // Process all of this. Yell 'gulp' in console.