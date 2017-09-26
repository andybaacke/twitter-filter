/* constants */
const appFolder   = 'src',
  distFolder    = 'dist',
  scriptsFolder = 'app',
  stylesFolder  = 'styles',
  tempFolder    = '.tmp',
  htmlMinify    = {
    caseSensitive: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true
  };

/* dependencies */
const chalk     = require('chalk'),
  del         = require('del'),
  fs          = require('fs'),
  gulp        = require('gulp'),
  htmlMin     = require('gulp-htmlmin'),
  cssPrefix   = require('gulp-autoprefixer'),
  cssMin      = require('gulp-clean-css'),
  jsMin       = require('gulp-uglify'),
  inject      = require('gulp-inject'),
  ngEmbed     = require('gulp-angular-embed-templates'),
  packageJ    = require('./package.json'),
  rename      = require('gulp-rename'),
  rev         = require('gulp-rev'),
  revOrgDel   = require('gulp-rev-delete-original'),
  sass        = require('gulp-sass'),
  sequence    = require('run-sequence'),
  server      = require('gulp-server-livereload'),
  webpack     = require("webpack-stream");

/* tasks */
gulp.task('clean:dist', function () {
  return del(distFolder + '/**/*');
});

gulp.task('clean:styles', function () {
  return del(tempFolder + '/' + stylesFolder + '/**/*');
});

gulp.task('clean:scripts', function () {
  return del(tempFolder + '/' + scriptsFolder + '/**/*');
});

gulp.task('copy:dist', function () {
  return gulp.src(['**/*.{json,xml,ico,jpg,png,gif,svg,txt}'], {cwd: appFolder})
           .pipe(gulp.dest(distFolder));
});

gulp.task('inject', function () {
  return gulp.src(appFolder + '/index.html')
          .pipe(inject(gulp.src(tempFolder + '/**', {read: false}), {ignorePath: tempFolder}))
          .on('error', showError)
          .pipe(gulp.dest(appFolder));
});

gulp.task('inline:templates', function () {
  return gulp.src('**/*.js', {cwd: tempFolder + '/' + scriptsFolder})
    .pipe(ngEmbed({
      basePath: appFolder,
      minimize: {
        empty: true,
        loose: true
      },
      skipTemplates: /\.noembed\.html$/
    }))
    .on('error', showError)
    .pipe(gulp.dest(distFolder + '/' + scriptsFolder));
});

gulp.task('minify:html', function () {
  return gulp.src(['**/*.html', '!app/**/*.html'], {cwd: appFolder})
    .pipe(htmlMin(htmlMinify))
    .on('error', showError)
    .pipe(gulp.dest(distFolder));
});

gulp.task('minify:noembedTemplates', function () {
  return gulp.src(['app/**/*.noembed.html'], {cwd: appFolder})
    .pipe(htmlMin(htmlMinify))
    .on('error', showError)
    .pipe(gulp.dest(distFolder + '/' + scriptsFolder));
});

gulp.task('minify:css', function () {
  return gulp.src(tempFolder + '/**/*.css')
    .pipe(cssMin({
      roundingPrecision: 4
    }))
    .on('error', showError)
    .pipe(gulp.dest(distFolder));
});

gulp.task('minify:js', function () {
  return gulp.src([tempFolder + '/**/*.js', appFolder + '/**/*.js'])
  .pipe(jsMin({
    output: {
      comments: 'some'
    }
  }))
  .on('error', showError)
  .pipe(gulp.dest(tempFolder));
});

gulp.task('rev:tmp', function () {
  return gulp.src(['**/*.js', '**/*.css'], {cwd: tempFolder})
    .pipe(rev())
    .pipe(revOrgDel())
    .on('error', showError)
    .pipe(gulp.dest(tempFolder));
});

gulp.task('sass', function () {
  return gulp.src(appFolder + '/' + stylesFolder + '/main.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(cssPrefix({
      browsers: ['last 1 version', 'android >= 4.0', 'ios >= 7.0', 'ie >= 9'],
      remove: false
    }))
    .pipe(rename(packageJ.name + '.css'))
    .on('error', showError)
    .pipe(gulp.dest(tempFolder + '/' + stylesFolder));
});

gulp.task('webpack', function() {
  return gulp.src('')
    .pipe(webpack(require('./webpack.config.js')))
    .on('error', showError)
    .pipe(gulp.dest(tempFolder + '/' + scriptsFolder));
});

gulp.task('watch', function () {
  gulp.watch(['**/*.scss'], {cwd: appFolder}, ['sass']);
  gulp.watch([appFolder + '/*.ts', appFolder + '/' + scriptsFolder + '/**/*.ts'], ['webpack']);
});

/* servers */
const fallback = 'index.html', //for html5Mode
  fallbackLogic = function(req, res, fallbackFile) {
    if (req.url.match(/\.(js|css|html|jpg|png|gif|json)/i)) {
      console.error(chalk.white.bgRed.bold('404 (Not Found) for file ' + req.url));
      res.statusCode = 404;
      res.end();
    } else {
      fs.createReadStream(fallbackFile).pipe(res);
    }
  },
  serverHost = 'localhost';

gulp.task('local', function (done) {
  sequence(
    ['clean:styles', 'clean:scripts'],
    ['sass', 'webpack'],
    'inject',
    'watch',
    function () {
      return gulp.src([appFolder, tempFolder])
        .pipe(server({
          host: serverHost,
          fallback: fallback,
          fallbackLogic: fallbackLogic,
          livereload: {
            enable: true,
            filter: function (filePath, cb) {
              cb( (/\.(js|html|css)$/.test(filePath)) ); //only reload on changes to these file extensions
            }
          },
          open: serverHost
        }))
        .on('end', function() {
        done();
      });
    }
  );
});

gulp.task('dist', ['build'], function () {
  gulp.src(distFolder)
    .pipe(server({
      host: serverHost,
      fallback: fallback,
      fallbackLogic: fallbackLogic,
      open: serverHost,
      https: true
    }));
});

/* build */
gulp.task('build', function (done) {
  return sequence(
    ['clean:styles', 'clean:scripts', 'clean:dist'],
    ['sass', 'webpack'],
    ['rev:tmp'],
    ['inject'],
    ['minify:html', 'minify:noembedTemplates', 'minify:js', 'minify:css'],
    ['inline:templates', 'copy:dist'],
    function () {
      done();
    }
  );
});

/* default */
gulp.task('default', ['local']);

/* helpers */
function showError (error) {
  console.log(chalk.white(error.toString()));
  this.emit('end')
}
